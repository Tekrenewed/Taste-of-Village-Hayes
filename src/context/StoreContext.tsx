import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { CartItem, MenuItem, Order, Booking } from '../types';
import { createOrder, streamOrders, updateOrderStatusInDb } from '../services/orderService';
import { createBooking, streamBookings, updateBookingStatus as updateDbBookingStatus } from '../services/bookingService';
import { streamAuthState, logoutAdmin as authLogout } from '../services/authService';
import { queueOrder, getQueuedOrders, removeFromQueue, getQueueLength } from '../lib/offlineQueue';
import { upsertCustomerOnOrder } from '../services/customerService';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, arrayUnion, arrayRemove, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { SHOP_CONFIG } from '../shopConfig';
import { db } from '../firebaseConfig';

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  hasUnreadBooking: boolean;
  clearUnreadBooking: () => void;
  isAdmin: boolean;
  authLoading: boolean;
  toggleAdmin: () => void;
  soldOutItems: string[];
  toggleItemSoldOut: (id: string, isCurrentlySoldOut: boolean) => Promise<void>;
  isOffline: boolean;
  offlineQueueCount: number;
  tableSession: any;
  playChime: (isUrgent?: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasUnreadBooking, setHasUnreadBooking] = useState(false);
  const isInitialBookingLoad = useRef(true);
  const previousBookingCount = useRef(0);
  const isInitialLoad = useRef(true);
  const previousOrderCount = useRef(0);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [soldOutItems, setSoldOutItems] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  const clearUnreadBooking = () => setHasUnreadBooking(false);

  const playChime = useCallback((isUrgent: boolean = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, startTime: number, vol = 0.5) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = isUrgent ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
        osc.start(startTime);
        osc.stop(startTime + 1.5);
      };
      
      if (isUrgent) {
        // Aggressive ALARM chime for bookings
        playTone(987.77, ctx.currentTime, 0.8); // B5
        playTone(987.77, ctx.currentTime + 0.2, 0.8); 
        playTone(987.77, ctx.currentTime + 0.4, 0.8);
      } else {
        // Gentle bell for standard orders
        playTone(880, ctx.currentTime); // A5 note
        playTone(1318.51, ctx.currentTime + 0.1); // E6 note
      }
      
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }, []);

  // 1. Maintain global auth state stream
  useEffect(() => {
    const unsubscribeAuth = streamAuthState((user) => {
      setIsAdmin(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 1.5 Maintain Zero-Cost Public Stream for 86'd Items via REST Polling
  useEffect(() => {
    const fetchSoldOut = async () => {
      try {
        const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:8080' : ''}/api/v1/menu/sold-out?storeId=${SHOP_CONFIG.tenant_id}`);
        if (!res.ok) return;
        const data = await res.json();
        setSoldOutItems(data.soldOutItems || []);
      } catch (err) {
        console.error("Error fetching sold out items:", err);
      }
    };

    fetchSoldOut();
    const interval = setInterval(fetchSoldOut, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // 1.6 Online/Offline detection + initial queue flush
  useEffect(() => {
    const syncQueue = async () => {
      try {
        const queued = await getQueuedOrders();
        for (const order of queued) {
          try {
            await createOrder(order);
            await removeFromQueue(order.id);
            console.log(`[OfflineQueue] Synced order ${order.id}`);
          } catch (err) {
            console.error(`[OfflineQueue] Still can't sync ${order.id}:`, err);
          }
        }
        setOfflineQueueCount(await getQueueLength());
      } catch (e) {
        console.error('[OfflineQueue] Flush failed:', e);
      }
    };

    const goOnline = () => {
      setIsOffline(false);
      syncQueue();
    };
    
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // CRITICAL: Flush queue immediately on boot if online (handles browser ungraceful closes)
    if (navigator.onLine) {
      syncQueue();
    } else {
      getQueueLength().then(setOfflineQueueCount);
    }

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);



  // 2. Only spin up sensitive streams once authenticated
  useEffect(() => {
    if (!isAdmin) return;
    
    console.log("StoreContext: Admin Authenticated. Spinning up Live Order & Booking Streams...");
    
    // Debounce rapid-fire Firestore snapshots (e.g. batch delivery imports)
    // to prevent N re-renders when N documents change in quick succession.
    let orderDebounce: ReturnType<typeof setTimeout>;
    let bookingDebounce: ReturnType<typeof setTimeout>;

    const unsubscribeOrders = streamOrders((liveOrders) => {
      clearTimeout(orderDebounce);
      orderDebounce = setTimeout(() => {
        const safeOrders = liveOrders || [];
        setOrders(safeOrders);
        
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
          previousOrderCount.current = safeOrders.length;
        } else {
          if (safeOrders.length > previousOrderCount.current) {
            playChime(false); // standard chime
          }
          previousOrderCount.current = safeOrders.length;
        }
      }, 100); // 100ms debounce — imperceptible to humans, prevents batch-storm
    });

    const unsubscribeBookings = streamBookings((liveBookings) => {
      clearTimeout(bookingDebounce);
      bookingDebounce = setTimeout(() => {
        const safeBookings = liveBookings || [];
        setBookings(safeBookings);
        
        if (isInitialBookingLoad.current) {
          isInitialBookingLoad.current = false;
          previousBookingCount.current = safeBookings.length;
        } else {
          if (safeBookings.length > previousBookingCount.current) {
            setHasUnreadBooking(true);
            playChime(true); // AGGRESSIVE alarm chime for bookings!
          }
          previousBookingCount.current = safeBookings.length;
        }
      }, 100);
    });

    // 2.5 Real-Time WebSocket Hub Connection (Ultra Low Latency KDS Sync)
    // We pass storeId so the Go backend specifically routes orders for this tenant.
    let ws: WebSocket;
    try {
      const wsUrl = import.meta.env.DEV
        ? `ws://localhost:8080/ws?storeId=${SHOP_CONFIG.tenant_id}` 
        : `wss://${window.location.hostname}/ws?storeId=${SHOP_CONFIG.tenant_id}`;
        
      ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const orderPayload = JSON.parse(event.data);
          console.log("[WebSocket] Low Latency Order Received:", orderPayload.id);
          // 1. Play chime immediately upon network receipt (faster than Firestore)
          playChime(false);
          // 2. We don't overwrite setOrders here to avoid race conditions with Firestore,
          // but we leverage the instant chime, which is exactly what kitchens need.
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };

      ws.onclose = () => console.log("[WebSocket] Closed, falling back to Firestore long-polling.");
    } catch (e) {
      console.warn("WebSocket init failed, continuing purely with Firebase:", e);
    }

    return () => {
      clearTimeout(orderDebounce);
      clearTimeout(bookingDebounce);
      unsubscribeOrders();
      unsubscribeBookings();
      if (ws) ws.close();
    };
  }, [isAdmin, playChime]);

  const [tableSession, setTableSession] = useState<any>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  // Parse table ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tParam = params.get('t') || params.get('table');
    if (tParam) {
      setTableId(tParam);
    }
  }, [window.location.search]);

  // Sync with Firestore if tableId is present
  useEffect(() => {
    if (!tableId) return;
    import('../services/tableService').then(({ streamTableSession }) => {
      const unsub = streamTableSession(tableId, (session) => {
        setTableSession(session);
        if (session && session.cart) {
          setCart(session.cart); // Keep local state in sync with Firebase
        }
      });
      return () => unsub();
    });
  }, [tableId]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let newCart;
      if (existing) {
        newCart = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      if (tableId) {
        import('../services/tableService').then(({ updateTableCart }) => updateTableCart(tableId, newCart));
      }
      return newCart;
    });
  }, [tableId]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => i.id !== id);
      if (tableId) {
        import('../services/tableService').then(({ updateTableCart }) => updateTableCart(tableId, newCart));
      }
      return newCart;
    });
  }, [tableId]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (tableId) {
      import('../services/tableService').then(({ updateTableCart }) => updateTableCart(tableId, []));
    }
  }, [tableId]);

  const addOrder = useCallback(async (order: Order) => {
    try {
      await createOrder(order);

      // Pre-register customer profile so they appear in rewards immediately
      // (Loyalty points are credited later when KDS marks order 'completed')
      if (order.customerPhone) {
        import('../services/loyaltyService').then(({ getOrCreateCustomer }) => {
          getOrCreateCustomer(
            order.customerPhone!,
            order.customerName || 'Customer'
          ).catch(err => console.error('[Loyalty] Pre-register customer failed:', err));
        });
      }
    } catch (err) {
      console.error('[Order] createOrder failed:', err);
      // For Web orders, rethrow so the UI shows the error
      if (!(order as any).source || (order as any).source === 'Web') {
        throw err;
      }
      // POS orders: queue in IndexedDB for later sync
      console.warn('[OfflineQueue] POS order queued locally:', err);
      await queueOrder(order);
      setOfflineQueueCount(await getQueueLength());
    }
  }, []);


  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await updateOrderStatusInDb(id, status);

    // When order completes, credit loyalty points to the customer
    if (status === 'completed') {
      const order = orders.find(o => o.id === id);
      if (order?.customerPhone) {
        upsertCustomerOnOrder(
          order.customerPhone,
          order.customerName || 'Guest',
          order.total
        ).catch(err => console.error('[CRM] Loyalty update failed:', err));

        // Process loyalty rewards (5th taste-of-village free, 5th chaat free, spend milestones)
        import('../services/loyaltyService').then(({ processOrderForLoyalty, getCustomerProfile }) => {
          processOrderForLoyalty(order).then(async (newRewards) => {
            if (newRewards.length > 0) {
              console.log(`[Loyalty] 🎉 ${newRewards.length} reward(s) earned for ${order.customerPhone}:`, newRewards.map(r => r.reason));
            }

            // ─── MARKETING AUTOMATION: Send emails via Cloud Functions ───
            try {
              const profile = await getCustomerProfile(order.customerPhone!);
              if (!profile?.email) return; // No email = no notification

              // Subscribe the token to the global tenant topic via our Node backend proxy
              const region = 'europe-west2';
              const projectId = SHOP_CONFIG.tenant_id;
              const baseUrl = `https://${region}-${projectId}.cloudfunctions.net`;

              // 1. If rewards were earned, send reward notification
              if (newRewards.length > 0) {
                fetch(`${baseUrl}/sendRewardEmail`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: profile.email,
                    name: profile.name || order.customerName,
                    rewards: newRewards.map(r => ({
                      reason: r.reason,
                      expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : r.expiresAt,
                    })),
                  }),
                }).catch(err => console.error('[Marketing] Reward email failed:', err));
              }

              // 2. Always send progress update after completed order
              fetch(`${baseUrl}/sendProgressEmail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: profile.email,
                  name: profile.name || order.customerName,
                  categoryCounts: profile.categoryCounts || {},
                  totalSpent: profile.totalSpent || 0,
                }),
              }).catch(err => console.error('[Marketing] Progress email failed:', err));

            } catch (emailErr) {
              console.error('[Marketing] Automation failed:', emailErr);
            }
          }).catch(err => console.error('[Loyalty] Reward processing failed:', err));
        });
      }
    }
  };

  const addBooking = useCallback(async (booking: Booking) => {
    await createBooking(booking);
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    await updateDbBookingStatus(id, status);
  }, []);

  const toggleAdmin = useCallback(async () => {
    if (isAdmin) {
      await authLogout();
    }
    // Note: Logging in is handled explicitly by the UI form, so toggleAdmin now only logs OUT.
  }, [isAdmin]);

  const toggleItemSoldOut = useCallback(async (id: string, isCurrentlySoldOut: boolean) => {
    // Optimistic UI update
    setSoldOutItems(prev => 
      isCurrentlySoldOut ? prev.filter(item => item !== id) : [...prev, id]
    );

    try {
      const res = await fetch(`${import.meta.env.DEV ? 'http://localhost:8080' : ''}/api/v1/menu/sold-out?storeId=${SHOP_CONFIG.tenant_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          isSoldOut: !isCurrentlySoldOut
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update sold out status');
      }
    } catch (e) {
      console.error("Error toggling sold out item:", e);
      // Revert on error could go here
    }
  }, []);

  const contextValue = useMemo(() => ({
    cart, addToCart, removeFromCart, clearCart,
    orders, setOrders, addOrder, updateOrderStatus,
    bookings, addBooking, updateBookingStatus,
    hasUnreadBooking, clearUnreadBooking,
    isAdmin, authLoading, toggleAdmin,
    soldOutItems, toggleItemSoldOut,
    isOffline, offlineQueueCount,
    tableSession,
    playChime
  }), [cart, orders, bookings, isAdmin, authLoading, soldOutItems, isOffline, offlineQueueCount, hasUnreadBooking, tableSession,
    addToCart, removeFromCart, clearCart, addOrder, updateOrderStatus, addBooking, updateBookingStatus,
    clearUnreadBooking, toggleAdmin, toggleItemSoldOut, setOrders, playChime]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};