import { Order, Booking } from '../types';
import { SHOP_CONFIG } from '../shopConfig';
import { createFirestoreAdapter } from './firestoreAdapter';
import type { RealtimeAdapter, Unsubscribe } from './types';

const API_BASE = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

/** Convert API response format to our canonical Order type */
function parseApiOrder(data: any): Order {
  return {
    id: data.id,
    customerName: data.customer_name || data.customerName || 'Walk-in',
    customerPhone: data.customer_phone || data.customerPhone || '',
    type: data.order_source || data.source || 'collection',
    items: data.items
      ? data.items.map((i: any) => ({
          name: i.name,
          price: i.price_paid || i.price || 0,
          quantity: i.quantity || 1,
          category: i.category || '',
          image: i.image || '/assets/placeholder.png',
        }))
      : [],
    total: data.gross_total || data.total || 0,
    status: data.status,
    timestamp: new Date(data.created_at || Date.now()),
    table_number: data.table_number,
    tableNumber: data.table_number,
    notes: data.notes,
    isPaid: data.payment_status === 'paid' || data.isPaid,
    source: data.order_source || data.source,
  } as Order;
}

export function createPollingAdapter(): RealtimeAdapter {
  const tenantId = SHOP_CONFIG.tenant_id;
  
  // We delegate bookings, menu, and write operations to FirestoreAdapter
  // which already correctly hits the Go REST API for writes (createOrder, updateOrder).
  const fsAdapter = createFirestoreAdapter();

  return {
    ...fsAdapter,
    orders: {
      ...fsAdapter.orders,
      
      subscribeToOrders(
        _tenantId: string,
        callback: (orders: Order[]) => void,
        onError?: (error: Error) => void
      ): Unsubscribe {
        const idToFetch = _tenantId || tenantId;
        let isPolling = true;

        const poll = async () => {
          if (!isPolling) return;
          try {
            // Fetch active orders via the REST endpoint
            const res = await fetch(`${API_BASE}/api/v1/stores/${idToFetch}/orders?status=pending,preparing,kitchen,ready`);
            if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
            
            const data = await res.json();
            const orders = (data || []).map((o: any) => parseApiOrder(o));
            
            // Sort logic (descending by timestamp)
            orders.sort((a: Order, b: Order) => b.timestamp.getTime() - a.timestamp.getTime());
            
            callback(orders);
          } catch (err: any) {
            console.error('[PollingAdapter] Orders Error:', err);
            if (onError) onError(err);
          }
        };

        poll(); // immediate fetch
        const intervalId = setInterval(poll, 5000); // 5s interval

        return () => {
          isPolling = false;
          clearInterval(intervalId);
        };
      }
    }
  };
}
