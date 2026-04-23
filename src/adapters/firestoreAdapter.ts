/**
 * Firestore Adapter
 * 
 * Implements the RealtimeAdapter interface using Firebase Firestore.
 * This is the ONLY file in the entire frontend that should import from
 * 'firebase/firestore' for real-time subscriptions.
 * 
 * When we're ready to switch to Redis + WebSockets:
 *   1. Create `websocketAdapter.ts` implementing the same interfaces
 *   2. Swap the import in RealtimeProvider.tsx
 *   3. Every UI component stays untouched
 */

import {
  collection, doc, setDoc, updateDoc,
  onSnapshot, query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, Booking } from '../types';
import { SHOP_CONFIG } from '../shopConfig';
import { ORDER_SOURCE } from '../lib/statusConstants';
import { captureOrderError } from '../lib/sentry';
import type { RealtimeAdapter, Unsubscribe } from './types';

// ─── Helpers ───

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';
const getAuthToken = async () => null;

/** Convert a Firestore document snapshot into our canonical Order type */
function parseFirestoreOrder(id: string, data: any): Order {
  return {
    id,
    customerName: data.customerName || data.customer_name || 'Walk-in',
    customerPhone: data.customerPhone || data.customer_phone || '',
    type: data.type || data.order_source || 'collection',
    items: data.items
      ? data.items.map((i: any) => ({
          name: i.name,
          price: i.price || i.price_paid || 0,
          quantity: i.quantity || 1,
          category: i.category || '',
          image: i.image || '/assets/placeholder.png',
        }))
      : [],
    total: data.total || data.gross_total || 0,
    status: data.status,
    timestamp: data.timestamp instanceof Timestamp
      ? data.timestamp.toDate()
      : new Date(data.timestamp || Date.now()),
    table_number: data.table_number,
    tableNumber: data.tableNumber,
    notes: data.notes,
    isPaid: data.isPaid,
    source: data.source,
  } as Order;
}

/** Convert a Firestore document snapshot into our canonical Booking type */
function parseFirestoreBooking(id: string, data: any): Booking {
  return {
    id,
    customerName: data.customerName || data.name || '',
    customerPhone: data.customerPhone || data.phone || '',
    email: data.email || '',
    date: data.date || '',
    time: data.time || '',
    guests: data.guests || 0,
    status: data.status || 'PENDING',
    name: data.name || data.customerName || '',
  };
}

// ─── Firestore Adapter Implementation ───

export function createFirestoreAdapter(): RealtimeAdapter {
  const tenantId = SHOP_CONFIG.tenant_id;

  return {
    // ─── Orders ───
    orders: {
      subscribeToOrders(
        _tenantId: string,
        callback: (orders: Order[]) => void,
        onError?: (error: Error) => void
      ): Unsubscribe {
        const q = query(
          collection(db, 'orders'),
          where('tenantId', '==', _tenantId || tenantId)
        );

        return onSnapshot(
          q,
          (snapshot) => {
            const orders = snapshot.docs
              .map((d) => parseFirestoreOrder(d.id, d.data()))
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            callback(orders);
          },
          (error) => {
            console.error('[Adapter/Firestore] Order subscription failed:', error);
            onError?.(error);
          }
        );
      },

      subscribeToSingleOrder(
        orderId: string,
        callback: (order: Order | null) => void,
        onError?: (error: Error) => void
      ): Unsubscribe {
        const docRef = doc(db, 'orders', orderId);
        return onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              callback(parseFirestoreOrder(docSnap.id, docSnap.data()));
            } else {
              callback(null);
            }
          },
          (error) => {
            console.error('[Adapter/Firestore] Single order subscription failed:', error);
            onError?.(error);
            callback(null);
          }
        );
      },

      async createOrder(order: Order): Promise<void> {
        const source = (order as any).source || ORDER_SOURCE.WEB;
        const isDev = import.meta.env.DEV;
        const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

        const payload = {
          external_id: order.id,
          store_id: tenantId,
          source,
          items: order.items.map((i) => ({
            name: i.name,
            price_paid: i.price * (i.quantity || 1),
          })),
          customer_name: order.customerName,
          customer_phone: order.customerPhone || '',
          table_number: order.type === 'dine-in' ? (order.table_number || 1) : null,
          apply_service_charge: false,
        };

        // Single write path: Go API handles BOTH Postgres + Firestore
        // This eliminates dual-write inconsistency where the frontend and backend
        // could write slightly different versions of the same order.
        try {
          const res = await fetch(`${apiBase}/api/v1/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error(`API returned ${res.status}: ${errorText}`);
            captureOrderError(new Error(`API ${res.status}: ${errorText}`), order.id, { source });
            throw new Error(`Order API failed: ${res.status}`);
          }
        } catch (error) {
          console.error('[Adapter] Order creation failed:', error);
          captureOrderError(
            error instanceof Error ? error : new Error(String(error)),
            order.id,
            { source, phase: 'api_call' }
          );
          // Offline fallback: Queue in IndexedDB for syncing when connection returns
          try {
            console.warn('[Adapter] API unreachable for createOrder, queuing for offline sync...');
            const { enqueueAction } = await import('../utils/offlineSync');
            
            // Queue the EXACT payload that would have gone to the Go API
            await enqueueAction({
              type: 'CREATE_ORDER',
              payload: payload
            });
            
            // We return void, but if a caller expects something, we can just log
            console.warn('[Adapter] Order queued offline. It will sync automatically when online.');
          } catch (offlineError) {
            console.error('[Adapter] CRITICAL: Both API and Offline Queue failed:', offlineError);
            throw new Error('Order could not be placed. Please check your connection and try again.');
          }
        }
      },

      async updateOrder(orderId: string, fields: Record<string, any>): Promise<void> {
        const isDev = import.meta.env.DEV;
        const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';
        const token = await getAuthToken();

        try {
          const res = await fetch(`${apiBase}/api/v1/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(fields),
          });
          if (res.ok) return; // Success — Go updated both Postgres and Firestore
          throw new Error(`API returned ${res.status}`);
        } catch (err) {
          console.warn('[Adapter] API unreachable for updateOrder, queuing for offline sync:', err);
          
          const { enqueueAction } = await import('../utils/offlineSync');
          await enqueueAction({
            type: 'UPDATE_ORDER',
            payload: { orderId, data: fields }
          });
        }
      },
    },

    // ─── Bookings ───
    bookings: {
      subscribeToBookings(
        callback: (bookings: Booking[]) => void,
        onError?: (error: Error) => void
      ): Unsubscribe {
        const q = query(collection(db, 'bookings'), orderBy('date', 'asc'));
        return onSnapshot(
          q,
          (snapshot) => {
            const bookings = snapshot.docs.map((d) =>
              parseFirestoreBooking(d.id, d.data())
            );
            callback(bookings);
          },
          (error) => {
            console.error('[Adapter/Firestore] Booking subscription failed:', error);
            onError?.(error);
          }
        );
      },

      async createBooking(booking: Booking): Promise<void> {
        try {
          const res = await fetch(`${API_BASE}/api/v1/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking),
          });
          if (res.ok) return;
          console.warn(`[Adapter] API create booking returned ${res.status}, falling back to Firestore`);
        } catch (err) {
          console.warn('[Adapter] API unreachable for booking create, falling back to Firestore:', err);
        }

        try {
          const docRef = doc(db, 'bookings', booking.id);
          await setDoc(docRef, booking);
        } catch (error) {
          console.error('[Adapter/Firestore] Booking create failed:', error);
          throw error;
        }
      },

      async updateBooking(bookingId: string, fields: Record<string, any>): Promise<void> {
        try {
          const res = await fetch(`${API_BASE}/api/v1/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fields),
          });
          if (res.ok) return;
          console.warn(`[Adapter] API update booking returned ${res.status}, falling back to Firestore`);
        } catch (err) {
          console.warn('[Adapter] API unreachable for booking update, falling back to Firestore:', err);
        }

        try {
          const docRef = doc(db, 'bookings', bookingId);
          await updateDoc(docRef, fields);
        } catch (error) {
          console.error('[Adapter/Firestore] Booking update failed:', error);
          throw error;
        }
      },
    },

    // ─── Menu ───
    menu: {
      subscribeToSoldOut(
        callback: (soldOutItems: string[]) => void,
        onError?: (error: Error) => void
      ): Unsubscribe {
        const docRef = doc(db, 'settings', 'sold_out');
        return onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              callback(data.items || []);
            } else {
              callback([]);
            }
          },
          (error) => {
            console.error('[Adapter/Firestore] Sold-out subscription failed:', error);
            onError?.(error);
          }
        );
      },
    },
  };
}
