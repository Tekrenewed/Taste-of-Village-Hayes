import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { SHOP_CONFIG } from '../shopConfig';
import { useStore } from '../context/StoreContext';
import { MenuItem, Order, CartItem, CustomerProfile, Reward } from '../types';
import QRCode from 'react-qr-code';
import { ROADMAP_QUESTIONS } from '../constants';
import { Taste of VillageTelemetry } from '../lib/telemetry';

// Local POS Sub-components & Services
import { SIZE_VARIATIONS, ITEM_MODIFIERS } from './AdminPOS/PosConstants';
import * as PrintingService from './AdminPOS/PrintingService';
import { useAiInsights } from '../hooks/useAiInsights';
import { AdminSidebar } from './AdminPOS/AdminSidebar';
import { HomePanel } from './AdminPOS/HomePanel';
import { HomeDashboard } from './AdminPOS/HomeDashboard';
import { BookingsPanel } from './AdminPOS/BookingsPanel';
import { MarketingPanel } from './AdminPOS/MarketingPanel';
import { RoadmapPanel } from './AdminPOS/RoadmapPanel';
import { PanelErrorBoundary } from '../components/PanelErrorBoundary';

// Lazy load heavy panels
const MenuPanel = lazy(() => import('./AdminPOS/MenuPanel').then(m => ({ default: m.MenuPanel })));
const StaffPanel = lazy(() => import('./AdminPOS/StaffPanel').then(m => ({ default: m.StaffPanel })));
const PosPanel = lazy(() => import('./AdminPOS/PosPanel').then(m => ({ default: m.PosPanel })));
const KdsPanel = lazy(() => import('./AdminPOS/KdsPanel').then(m => ({ default: m.KdsPanel })));
const AnalyticsPanel = lazy(() => import('./AdminPOS/AnalyticsPanel').then(m => ({ default: m.AnalyticsPanel })));
const TablesPanel = lazy(() => import('./AdminPOS/TablesPanel').then(m => ({ default: m.TablesPanel })));
const CrmPanel = lazy(() => import('./AdminPOS/CrmPanel').then(m => ({ default: m.CrmPanel })));
const PinPad = lazy(() => import('./AdminPOS/PinPad').then(m => ({ default: m.PinPad })));
const WebsitePanel = lazy(() => import('./AdminPOS/WebsitePanel').then(m => ({ default: m.WebsitePanel })));
const RefundsPanel = lazy(() => import('./AdminPOS/RefundsPanel').then(m => ({ default: m.RefundsPanel })));
const ItemBuilderPanel = lazy(() => import('./AdminPOS/ItemBuilderPanel').then(m => ({ default: m.ItemBuilderPanel })));
const EodPanel = lazy(() => import('./AdminPOS/EodPanel').then(m => ({ default: m.EodPanel })));


import { useStaff } from '../hooks/useStaff';
import { useCrm } from '../hooks/useCrm';
import { useMarketing } from '../hooks/useMarketing';
import { usePosCart } from '../hooks/usePosCart';
import { WeatherInsight } from './AdminPOS/WeatherService';
import { StaffingRecommendation } from '../services/GeminiService';
import {
  ChefHat, Calendar, AlertTriangle, FileText, Settings, Clock, Plus, Minus,
  Trash2, Edit2, User, Users, Phone, DollarSign, BarChart3, Zap, LayoutGrid,
  Play, LayoutDashboard, ShoppingCart, CreditCard, Banknote, Check, X,
  Star, ExternalLink, Sun, Moon, MoreHorizontal, Printer, MessageCircle,
  ChevronLeft, ChevronRight, Pencil, Lock
} from 'lucide-react';

export const Admin = () => {
  const { orders, setOrders, addOrder, bookings, updateOrderStatus, updateBookingStatus, soldOutItems, toggleItemSoldOut, isOffline, offlineQueueCount, hasUnreadBooking, clearUnreadBooking } = useStore();
  const [activeStaff, setActiveStaff] = useState<{name: string, role: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'kds' | 'tables' | 'bookings' | 'roadmap' | 'menu' | 'crm' | 'staff' | 'analytics' | 'marketing' | 'pos' | 'website' | 'refunds' | 'itembuilder' | 'eod'>('home');
  const [categories, setCategories] = useState<any[]>([]);
  const [callerId, setCallerId] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  
  // Compute pending orders first — needed by AI hook
  const pendingOrders = (orders || []).filter(o => o?.status !== 'completed' && o?.status !== 'web_holding');
  
  // AI Operational Brain
  const { weatherInsight, staffingInsight, prepInsight, currentTime } = useAiInsights(pendingOrders.length);

  // Phase 3: POS Order-Taking State
  const [posMenu, setPosMenu] = useState<MenuItem[]>([]);
  const [posCategory, setPosCategory] = useState<string>('🔥 Popular');
  
  const {
    posCart, setPosCart, posOrderType, setPosOrderType, posTable, setPosTable,
    posGuestCount, setPosGuestCount, posSplitBill, setPosSplitBill,
    posCustomerName, setPosCustomerName, posCustomerPhone, setPosCustomerPhone, posCustomerEmail, setPosCustomerEmail,
    sizePickerItem, setSizePickerItem, modifierPickerItem, setModifierPickerItem,
    modifierSelections, setModifierSelections, posLoyaltyProfile, setPosLoyaltyProfile,
    posAvailableRewards, setPosAvailableRewards, posAppliedReward, setPosAppliedReward,
    posDiscountAmount, setPosDiscountAmount, posSubmitting, posLastOrder,
    posSubtotal, posTotal, addToPosCart, addSizedItemToCart, addModifiedItemToCart,
    updatePosQty, submitPosOrder
  } = usePosCart(addOrder, soldOutItems);



  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [posDarkMode, setPosDarkMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('posDarkMode') === 'true';
    return true;
  });
  const [reviewPrompt, setReviewPrompt] = useState<{orderId: string; phone?: string} | null>(null);
  
  // Phase 4 Hooks
  const { 
    staffList, activeShifts, rotaData, rotaWeekId, setRotaWeekId, updateShift, downloadTimesheet, loadingRota,
    staffPin, setStaffPin, staffMessage, setStaffMessage, newStaffName, setNewStaffName, newStaffPin, setNewStaffPin, newStaffRole, setNewStaffRole, showStaffForm, setShowStaffForm
  } = useStaff();
  
  const { 
    customers, customerHistory, loadingHistory, fetchCustomerHistory 
  } = useCrm(orders);

  const { 
    segments, reviewQueue, setReviewQueue 
  } = useMarketing(activeTab);

  // Add Menu Item Modal State
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [addMenuCategory, setAddMenuCategory] = useState('');
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
  const [newMenuItemDesc, setNewMenuItemDesc] = useState('');
  const [customMenuItems, setCustomMenuItems] = useState<any[]>([]);

  // Edit Menu Item State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [menuSyncing, setMenuSyncing] = useState(false);

  // AI Operational Brain now handled by useAiInsights hook

  const [currentPrinterIp, setCurrentPrinterIp] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('epsonIp') || '192.168.1.136';
    return '192.168.1.136';
  });
  const [printerProtocol, setPrinterProtocol] = useState<'http' | 'https'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('epsonProtocol') as 'http' | 'https') || 'http';
    return 'http'; // Default to HTTP for local Epson POS printers
  });

  const printTicket = async (order: any) => {
    try {
      await PrintingService.printTicket(order, { ip: currentPrinterIp, protocol: printerProtocol });
    } catch (err: any) {
      // Fallback to window.print() if ePOS fails
      const wantsProceed = window.confirm(
        `Printer connection failed at ${currentPrinterIp}.\n\n` +
        `SAMSUNG (ANDROID) TABLET SETUP REQUIRED:\n` +
        `1. Open a new Chrome tab and go to: chrome://flags\n` +
        `2. Search for "Private Network Access"\n` +
        `3. Set it to DISABLED\n` +
        `4. Go to https://${currentPrinterIp} and accept the security warning.\n\n` + 
        `Press OK to use generic browser print for now.`
      );
      if (wantsProceed) {
        setPrintingOrder(order);
        setTimeout(() => {
          window.print();
          setTimeout(() => setPrintingOrder(null), 1000);
        }, 100);
      }
    }
  };

  const printBooking = async (booking: any) => {
    try {
      await PrintingService.printBooking(booking, { ip: currentPrinterIp, protocol: printerProtocol });
    } catch (err) {
      console.warn("Booking print failed, skipping...");
    }
  };

  const [zReportLoading, setZReportLoading] = useState(false);
  const printZReport = async () => {
    setZReportLoading(true);
    try {
      await PrintingService.printZReport(orders, { ip: currentPrinterIp, protocol: printerProtocol });
      alert("Z-Report sent to printer perfectly!");
    } catch (err) {
      alert("Print failed. Check tablet connection and Chrome PNA flag.");
    } finally {
      setZReportLoading(false);
    }
  };


  // Calculate active tables based on pending orders

  useEffect(() => {
    const tenantId = SHOP_CONFIG.tenant_id;
    if (activeTab === 'menu') {
      // Load menu from Firestore (falls back to constants if Firestore is empty)
      import('../services/menuService').then(({ getMenuItems }) => {
        getMenuItems().then(firestoreItems => {
          const allItems = [...firestoreItems, ...customMenuItems];
          const uniqueCats = [...new Set((allItems || []).map(i => i?.category || 'General'))];
          const builtCats = uniqueCats.map(cat => {
            const safeCat = String(cat || 'General');
            return {
              id: safeCat,
              name: safeCat.charAt(0).toUpperCase() + safeCat.slice(1).replace(/_/g, ' '),
              products: allItems.filter(i => i.category === cat).map(i => ({...i, is86d: soldOutItems.includes(i.id)}))
            };
          });
          setCategories(builtCats);
        });
      });
    } else if (activeTab === 'analytics') {
      // Analytics graph data handled inline
    } else if (activeTab === 'tables') {
      fetch(`/api/v1/stores/f4100da2-1111-1111-1111-000000000001/tables`)
        .then(res => res.json())
        .then(data => setTables(Array.isArray(data) && data.length > 0 ? data : Array.from({length: 18}, (_, i) => ({id: i+1, table_number: i+1}))))
        .catch(err => {
          console.error("Could not load tables", err);
          setTables(Array.from({length: 18}, (_, i) => ({id: i+1, table_number: i+1})));
        });
    } else if (activeTab === 'pos') {
      import('../services/menuService').then(({ getMenuItems }) => {
        getMenuItems().then(firestoreItems => {
          const items = firestoreItems.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            category: d.category,
            price: d.price,
            image: d.image || '/assets/placeholder.png',
            popular: d.popular,
            is86d: soldOutItems.includes(d.id) || d.active === false
          }));
          setPosMenu(items);
          if (items.length > 0 && !posCategory) {
            setPosCategory('🔥 Popular');
          }
        });
      });
      // Also fetch tables for table picker
      fetch(`/api/v1/stores/f4100da2-1111-1111-1111-000000000001/tables`)
        .then(res => res.json())
        .then(data => setTables(Array.isArray(data) && data.length > 0 ? data : Array.from({length: 18}, (_, i) => ({id: i+1, table_number: i+1}))))
        .catch(() => {
          setTables(Array.from({length: 18}, (_, i) => ({id: i+1, table_number: i+1})));
        });
    }
  }, [activeTab, orders, soldOutItems]);

  // Menu tab: fetch custom menu items from Go API
  useEffect(() => {
    if (activeTab !== 'menu') return;
    let cancelled = false;
    const loadCustomItems = async () => {
      try {
        const res = await fetch('/api/v1/menu/custom');
        if (res.ok) {
          const items = await res.json();
          if (!cancelled) setCustomMenuItems(items);
        }
      } catch (e) { console.error('Failed to fetch custom menu items:', e); }
    };
    loadCustomItems();
    return () => { cancelled = true; };
  }, [activeTab]);

  // POS: Loyalty lookup when phone number is entered
  useEffect(() => {
    if (activeTab !== 'pos') return;
    if (!posCustomerPhone || posCustomerPhone.trim().length < 7) {
      setPosLoyaltyProfile(null);
      setPosAvailableRewards([]);
      setPosAppliedReward(null);
      setPosDiscountAmount(0);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { getCustomerProfile, getAvailableRewards } = await import('../services/loyaltyService');
        const profile = await getCustomerProfile(posCustomerPhone.trim());
        if (profile) {
          setPosLoyaltyProfile(profile);
          const rewards = await getAvailableRewards(posCustomerPhone.trim());
          setPosAvailableRewards(rewards);
        } else {
          setPosLoyaltyProfile(null);
          setPosAvailableRewards([]);
        }
      } catch (err) {
        console.error('[Loyalty] Lookup failed:', err);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [posCustomerPhone, activeTab]);

  // Dynamically build POS categories from posMenu
  const posCategoriesRaw = [...new Set((posMenu || []).map(i => i?.category || 'General'))];

  posCategoriesRaw.sort((a, b) => {
    const catA = String(a).toLowerCase();
    const catB = String(b).toLowerCase();
    
    const getWeight = (cat: string) => {
      if (cat === 'starters') return 1;
      if (cat === 'curries') return 2;
      if (cat === 'grills') return 3;
      if (cat === 'biryani') return 4;
      if (cat === 'naan_breads') return 5;
      if (cat === 'drinks') return 6;
      if (cat === 'desserts') return 7;
      return 10;
    };

    const weightA = getWeight(catA);
    const weightB = getWeight(catB);

    if (weightA !== weightB) return weightA - weightB;
    return catA.localeCompare(catB);
  });

  const POS_SECTIONS = [
    { key: '🔥 Popular', label: '🔥 Popular', filter: (i: any) => i?.popular === true },
    ...posCategoriesRaw.map(cat => {
      const safeCat = String(cat || 'General');
      return {
        key: safeCat,
        label: safeCat.charAt(0).toUpperCase() + safeCat.slice(1).replace(/_/g, ' '),
        filter: (i: any) => i?.category === safeCat
      };
    })
  ];

  const simulateIncomingCall = async () => {
    const mockPhone = '07890123456';
    const tenantId = SHOP_CONFIG.tenant_id;
    setCallerId({ phone: mockPhone, loading: true });
    try {
      const res = await fetch(`/api/crm/lookup/${mockPhone}?tenantId=${tenantId}`);
      if (res.ok) setCallerId(await res.json());
      else setCallerId({ phone: mockPhone, name: null });
    } catch (err) {
      setCallerId({ phone: mockPhone, name: null });
    }
  };

  const simulateDeliveryOrder = async (provider: string) => {
    try {
      await fetch(`/api/delivery-hub/simulate/${provider}`, {
        method: 'POST',
        headers: { 'x-tenant-id': SHOP_CONFIG.tenant_id }
      });
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  const simulatePayment = async () => {
    try {
      await fetch(`/api/payments/simulate`, {
        method: 'POST',
        headers: { 'x-tenant-id': SHOP_CONFIG.tenant_id, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'Worldpay' })
      });
    } catch (err) {
      console.error('Payment simulation failed', err);
    }
  };

  // Phase 3: Update order status via Go API (PostgreSQL + Firestore sync)
  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // If completing, show Google Review prompt
      if (newStatus === 'completed') {
        const order = orders.find(o => o.id === orderId);
        const phone = order?.customerPhone || (order as any)?.customer_phone;
        setReviewPrompt({ orderId, phone });
      }
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const notifyCustomer = (order: any) => {
    if (!order.customerPhone) {
      alert("No phone number provided for this order.");
      return;
    }
    const domain = window.location.origin;
    const trackingUrl = `${domain}/track/${order.id}`;
    const statusMap: Record<string, string> = {
      'web_holding': 'received and awaiting kitchen approval',
      'pending': 'accepted and awaiting preparation',
      'preparing': 'currently being prepared by our chefs',
      'ready': 'ready for collection in-store!'
    };
    const msg = `Salam ${order.customerName},\n\nYour Taste of Village order is ${statusMap[order.status] || order.status}\n\nTrack your order securely live here:\n${trackingUrl}`;
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Phase 3: Handle payment via Go API
  const handlePayment = async (orderId: string, method: 'card' | 'cash') => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });
      if (!res.ok) throw new Error('Payment failed');
    } catch (err) {
      console.error('Payment failed', err);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      // Must pass token as it requires AuthMiddleware. Using same token mechanism if any.
      // Assuming AdminPOS calls are proxied or have cookies set. Let's make standard fetch.
      const res = await fetch(`/api/v1/payments/verify?order_id=${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('restaurant_os_token')}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`Verification failed: ${text}`);
      } else {
        alert('Payment synced successfully. UI will update shortly.');
      }
    } catch (err) {
      console.error('Verify failed', err);
      alert('Network error verifying payment.');
    }
  };

  const formatKdsDate = (timestamp: any) => {
    try {
      const date = new Date(timestamp);
      const str = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${str}, ${time}`;
    } catch (e) {
      return '';
    }
  };


  const allNavItemsRaw = [
    { id: 'home', icon: LayoutDashboard, label: 'Home' },
    { id: 'pos', icon: ShoppingCart, label: 'Order' },
    { id: 'kds', icon: ChefHat, label: 'KDS' },
    { id: 'website', icon: FileText, label: 'Web' },
    { id: 'tables', icon: LayoutGrid, label: 'Tables' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'roadmap', icon: FileText, label: 'Roadmap' },
    { id: 'menu', icon: Settings, label: 'Menu' },
    { id: 'crm', icon: Users, label: 'Customers' },
    { id: 'staff', icon: Clock, label: 'Staff' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'marketing', icon: Zap, label: 'Marketing' },
  ];

  const allNavItems = allNavItemsRaw.filter(item => {
    if (activeStaff?.role === 'admin' || activeStaff?.role === 'manager') return true;
    return ['home', 'pos', 'kds', 'tables', 'bookings', 'staff'].includes(item.id);
  });
  
  const mobileQuickTabs = allNavItems.slice(0, 4);
  const mobileMoreTabs = allNavItems.slice(4);

  return (
    <>
      {!activeStaff && <PinPad onUnlock={setActiveStaff} />}
      
      {/* Generic Browser Print Fallback */}
      {printingOrder && (
        <div className="receipt-printable">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>TASTE OF VILLAGE</h2>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>766B Uxbridge Rd, Hayes UB4 0RS</p>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>Order: #{printingOrder?.id?.slice(-4) || '???'}</p>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>{printingOrder?.timestamp ? new Date(printingOrder.timestamp).toLocaleString() : ''}</p>
          </div>
          <p style={{ borderBottom: '1px dashed black', margin: '5px 0' }}></p>
          <div style={{ fontWeight: 'bold', margin: '5px 0' }}>
            Type: {printingOrder.type.toUpperCase()}<br/>
            {printingOrder.table_number && `Table: ${printingOrder.table_number}`}
            {printingOrder.customerName && `Name: ${printingOrder.customerName}`}
          </div>
          <p style={{ borderBottom: '1px dashed black', margin: '5px 0' }}></p>
          {printingOrder.items.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <div>
                <span>{item.quantity}x {item.name}</span>
                {item.modifiers && Object.keys(item.modifiers || {}).length > 0 && (
                  <div style={{ fontSize: '10px', paddingLeft: '8px' }}>
                    {Object.values(item.modifiers || {}).map((v: any, idx) => (
                      <div key={idx}>- {v}</div>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ marginLeft: '10px' }}>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <p style={{ borderBottom: '1px dashed black', margin: '5px 0' }}></p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>
            <span>TOTAL</span>
            <span>£{(Number(printingOrder?.total) || 0).toFixed(2)}</span>
          </div>
          <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '15px' }}>Thank you for visiting!<br/>Taste the authenticity.</p>
        </div>
      )}

      <div className="pos-native-lock min-h-[100dvh] bg-pine pos-dark text-[#F0E6D6] flex flex-col md:flex-row font-sans transition-colors duration-500">
        
        {/* Modular Sidebar */}
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          posDarkMode={posDarkMode}
          setPosDarkMode={setPosDarkMode}
          activeStaff={activeStaff}
        />

        {/* Mobile Nav Placeholder */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-pine/95 border-t border-white/10 backdrop-blur-xl flex justify-around p-4">
           {allNavItems.slice(0, 4).map(item => (
             <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-terracotta' : 'text-white/50'}`}>
                <item.icon size={20} />
                <span className="text-[10px] font-bold uppercase">{item.label}</span>
             </button>
           ))}
           <button onClick={() => setMobileMoreOpen(!mobileMoreOpen)} className="text-white/50"><MoreHorizontal size={20}/></button>
        </nav>

        {/* Main Panel Content */}
        <main className="flex-1 p-4 pb-24 md:p-12 md:pb-12 overflow-y-auto relative">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-terracotta/5 blur-[120px] pointer-events-none"></div>

          <Suspense fallback={<div className="flex h-[50vh] flex-col gap-6 items-center justify-center p-20 text-terracotta font-bold font-display uppercase tracking-[5px] animate-pulse"><div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>Loading Module...</div>}>
            {activeTab === 'home' && (
              <PanelErrorBoundary name="Dashboard">
                <div className="space-y-6 md:space-y-10">
                  <HomePanel 
                    posDarkMode={posDarkMode} 
                    setActiveTab={setActiveTab} 
                    orders={orders}
                    pendingOrders={pendingOrders}
                    weatherInsight={weatherInsight}
                    staffingInsight={staffingInsight}
                  />
                  <HomeDashboard orders={orders} posDarkMode={posDarkMode} updateOrderStatus={updateOrderStatus} setActiveTab={setActiveTab} />
                </div>
              </PanelErrorBoundary>
            )}

            {activeTab === 'pos' && (
              <PanelErrorBoundary name="POS">
                <PosPanel
                  posMenu={posMenu} posCart={posCart} setPosCart={setPosCart} posCategory={posCategory} setPosCategory={setPosCategory}
                  posCustomerName={posCustomerName} setPosCustomerName={setPosCustomerName} posCustomerPhone={posCustomerPhone} setPosCustomerPhone={setPosCustomerPhone}
                  posCustomerEmail={posCustomerEmail} setPosCustomerEmail={setPosCustomerEmail} posOrderType={posOrderType} setPosOrderType={setPosOrderType}
                  posTable={posTable} setPosTable={setPosTable} posGuestCount={posGuestCount} setPosGuestCount={setPosGuestCount}
                  posSplitBill={posSplitBill} setPosSplitBill={setPosSplitBill} posSubtotal={posSubtotal} posTotal={posTotal}
                  posDiscountAmount={posDiscountAmount} posLoyaltyProfile={posLoyaltyProfile} posAvailableRewards={posAvailableRewards}
                  posAppliedReward={posAppliedReward} onApplyReward={(reward: Reward) => {
                    if (posAppliedReward?.id === reward.id) { setPosAppliedReward(null); setPosDiscountAmount(0); }
                    else { setPosAppliedReward(reward); setPosDiscountAmount(reward.type === 'discount_fixed' ? (reward.value || 0) : 0); }
                  }}
                  posSubmitting={posSubmitting} posLastOrder={posLastOrder} posDarkMode={posDarkMode} setPosDarkMode={setPosDarkMode}
                  sizePickerItem={sizePickerItem} setSizePickerItem={setSizePickerItem} modifierPickerItem={modifierPickerItem} setModifierPickerItem={setModifierPickerItem}
                  modifierSelections={modifierSelections} setModifierSelections={setModifierSelections} tables={tables} isOffline={isOffline}
                  offlineQueueCount={offlineQueueCount} mobileCartOpen={mobileCartOpen} setMobileCartOpen={setMobileCartOpen}
                  addToPosCart={addToPosCart} addSizedItemToCart={addSizedItemToCart} addModifiedItemToCart={addModifiedItemToCart}
                  updatePosQty={updatePosQty} submitPosOrder={submitPosOrder} printTicket={printTicket} POS_SECTIONS={POS_SECTIONS}
                />
              </PanelErrorBoundary>
            )}

            {activeTab === 'kds' && (
              <PanelErrorBoundary name="KDS">
                <KdsPanel
                  pendingOrders={pendingOrders} posDarkMode={posDarkMode} currentTime={currentTime} formatKdsDate={formatKdsDate}
                  printTicket={printTicket} handleStatusUpdate={handleStatusUpdate} notifyCustomer={notifyCustomer} handlePayment={handlePayment} 
                  handleVerifyPayment={handleVerifyPayment} prepInsight={prepInsight}
                />
              </PanelErrorBoundary>
            )}

            {activeTab === 'bookings' && (
              <PanelErrorBoundary name="Bookings">
                <BookingsPanel bookings={bookings} posDarkMode={posDarkMode} updateBookingStatus={updateBookingStatus as any} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'marketing' && (
              <PanelErrorBoundary name="Marketing">
                <MarketingPanel segments={segments} posDarkMode={posDarkMode} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'roadmap' && (
              <PanelErrorBoundary name="Roadmap">
                <RoadmapPanel simulateDeliveryOrder={simulateDeliveryOrder} simulatePayment={simulatePayment} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'menu' && (
              <MenuPanel
                categories={categories} soldOutItems={soldOutItems} toggleItemSoldOut={toggleItemSoldOut} editingItem={editingItem} setEditingItem={setEditingItem}
                editName={editName} setEditName={setEditName} editPrice={editPrice} setEditPrice={setEditPrice} editDesc={editDesc} setEditDesc={setEditDesc}
                editCategory={editCategory} setEditCategory={setEditCategory} savingEdit={savingEdit} setSavingEdit={setSavingEdit}
                pendingImageFile={pendingImageFile} setPendingImageFile={setPendingImageFile} showAddMenuItem={showAddMenuItem} setShowAddMenuItem={setShowAddMenuItem}
                addMenuCategory={addMenuCategory} setAddMenuCategory={setAddMenuCategory} newMenuItemName={newMenuItemName} setNewMenuItemName={setNewMenuItemName}
                newMenuItemPrice={newMenuItemPrice} setNewMenuItemPrice={setNewMenuItemPrice} newMenuItemDesc={newMenuItemDesc} setNewMenuItemDesc={setNewMenuItemDesc}
                menuSyncing={menuSyncing} setMenuSyncing={setMenuSyncing} currentPrinterIp={currentPrinterIp} setCurrentPrinterIp={setCurrentPrinterIp}
                printerProtocol={printerProtocol} setPrinterProtocol={setPrinterProtocol} printZReport={printZReport} posSubmitting={posSubmitting}
                posDarkMode={posDarkMode}
              />
            )}

            {activeTab === 'itembuilder' && (
              <PanelErrorBoundary name="Item Builder">
                <ItemBuilderPanel posDarkMode={posDarkMode} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'tables' && (
              <PanelErrorBoundary name="Tables">
                <TablesPanel 
                  tables={tables} 
                  pendingOrders={pendingOrders} 
                  onTableClick={(num) => {
                    setPosTable(num);
                    setActiveTab('pos');
                  }}
                />
              </PanelErrorBoundary>
            )}

            {activeTab === 'analytics' && (
              <PanelErrorBoundary name="Analytics">
                <AnalyticsPanel orders={orders} posDarkMode={posDarkMode} printZReport={printZReport} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'crm' && (
              <PanelErrorBoundary name="Customers">
                <CrmPanel 
                  customers={customers} simulateIncomingCall={simulateIncomingCall} customerHistory={customerHistory}
                  loadingHistory={loadingHistory} fetchHistory={fetchCustomerHistory}
                />
              </PanelErrorBoundary>
            )}

            {activeTab === 'staff' && (
              <PanelErrorBoundary name="Staff">
                <StaffPanel 
                  staffPin={staffPin} setStaffPin={setStaffPin} staffMessage={staffMessage} setStaffMessage={setStaffMessage}
                  activeShifts={activeShifts} staffList={staffList} showStaffForm={showStaffForm} setShowStaffForm={setShowStaffForm}
                  newStaffName={newStaffName} setNewStaffName={setNewStaffName} newStaffPin={newStaffPin} setNewStaffPin={setNewStaffPin}
                  newStaffRole={newStaffRole} setNewStaffRole={setNewStaffRole} rotaWeekId={rotaWeekId} setRotaWeekId={setRotaWeekId} 
                  rotaData={rotaData} updateShift={updateShift} downloadTimesheet={downloadTimesheet}
                  loadingRota={loadingRota}
                />
              </PanelErrorBoundary>
            )}

            {activeTab === 'website' && (
              <PanelErrorBoundary name="Website">
                <WebsitePanel orders={orders} posDarkMode={posDarkMode} updateOrderStatus={updateOrderStatus as any} setActiveTab={setActiveTab} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'refunds' && (
              <PanelErrorBoundary name="Refunds">
                <RefundsPanel orders={orders} posDarkMode={posDarkMode} updateOrderStatus={updateOrderStatus as any} />
              </PanelErrorBoundary>
            )}

            {activeTab === 'eod' && (
              <PanelErrorBoundary name="EOD Z-Report">
                <EodPanel posDarkMode={posDarkMode} />
              </PanelErrorBoundary>
            )}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      {callerId && (
        <div className="fixed bottom-12 right-12 glass-pine p-10 rounded-[4rem] border-2 border-terracotta animate-liquid z-[100] w-[400px] warm-glow">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-terracotta text-pine rounded-2xl flex items-center justify-center animate-glow-pulse"><Phone size={32} /></div>
            <div>
              <p className="text-[10px] font-black text-terracotta tracking-[5px] uppercase mb-1">Incoming Call</p>
              <p className="font-bold text-3xl tracking-tighter">{callerId.phone}</p>
            </div>
          </div>
          {callerId.name ? (
            <div className="bg-white/5 p-8 rounded-3xl mb-8">
              <p className="text-2xl font-bold mb-1 tracking-tight">{callerId.name}</p>
              <p className="text-sm font-black text-terracotta uppercase tracking-widest">{callerId.points} Points Available</p>
            </div>
          ) : <div className="p-8 border border-dashed border-white/10 rounded-3xl mb-8"><p className="text-sm text-cream/40 italic">Unknown Customer Record</p></div>}
          <div className="flex gap-4">
            <button onClick={() => setCallerId(null)} className="flex-1 glass-pine py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] opacity-40 hover:opacity-100 transition-all">Dismiss</button>
            <button onClick={() => { setActiveTab('pos'); setPosCustomerPhone(callerId.phone); setCallerId(null); }} className="flex-1 bg-terracotta text-pine py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] luxury-shadow hover:scale-105 transition-all">Take Order</button>
          </div>
        </div>
      )}

      {reviewPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center" onClick={() => setReviewPrompt(null)}>
          <div className="glass-pine p-10 rounded-[3rem] border-2 border-terracotta max-w-md w-full mx-4 animate-liquid" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-terracotta/20 rounded-full flex items-center justify-center">
                <Star className="text-terracotta fill-terracotta" size={36} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Order Completed!</h3>
              <p className="text-creamMuted">Send a Google Review request to the customer?</p>
            </div>
            {reviewPrompt.phone ? (
              <a
                href={`https://wa.me/${reviewPrompt.phone.replace(/^0/, '44').replace(/\s/g, '')}?text=${encodeURIComponent('Thanks for visiting Taste of Village! ❤️ We\'d love your feedback — leave us a quick Google Review: https://share.google/DlwFbPHWWJeln3Stt')}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all mb-4"
              >
                <ExternalLink size={18}/> Send via WhatsApp
              </a>
            ) : (
              <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl mb-4 text-center">
                <p className="text-sm text-cream/40 italic">No phone number on this order</p>
              </div>
            )}
            <button onClick={() => setReviewPrompt(null)} className="w-full py-4 glass-pine rounded-2xl font-black text-[10px] uppercase tracking-[3px] opacity-60 hover:opacity-100 transition-all">Skip</button>
          </div>
        </div>
      )}

      {hasUnreadBooking && (
        <div className="fixed inset-0 z-[9999] bg-pine/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-pine border-4 border-red-500 rounded-[3rem] p-12 max-w-2xl w-full mx-4 shadow-[0_0_100px_rgba(239,68,68,0.5)] flex flex-col items-center text-center animate-pulse">
            <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mb-8"><AlertTriangle className="text-red-500 w-20 h-20" /></div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">New Web Booking!</h2>
            <p className="text-terracotta text-xl mb-12">A customer has just requested a new Reserve & Collect slot online. Check the Bookings tab immediately!</p>
            <button onClick={() => { setActiveTab('bookings'); clearUnreadBooking(); }} className="w-full py-6 bg-red-500 text-white rounded-3xl font-black text-xl uppercase tracking-widest hover:bg-red-600 transition-colors shadow-xl">Open Bookings & Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
};

