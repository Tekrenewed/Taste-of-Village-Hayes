import { collection, where, doc, setDoc, updateDoc, onSnapshot, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, CartItem } from '../types';
import { ORDER_STATUS, ORDER_SOURCE } from '../lib/statusConstants';
import { captureOrderError } from '../lib/sentry';
import { SHOP_CONFIG } from '../shopConfig';

const ORDERS_COLLECTION = 'orders';

/**
 * Creates a new order via the Go API (single canonical path).
 * 
 * ALL orders — POS, Web, Kiosk — go through the same API endpoint.
 * This eliminates dual-path data inconsistencies where POS writes
 * directly to Firestore with a different schema than the API.
 * 
 * Flow: Frontend → Go API → PostgreSQL (source of truth) → Firestore (sync layer) → KDS
 * 
 * Fallback: If the API is unreachable (e.g. Cloud Run cold start or outage),
 * POS orders fall back to a direct Firestore write so in-store operations
 * are never blocked. Web orders have no fallback — they show an error.
 */
export async function createOrder(order: Order): Promise<void> {
  const source = (order as any).source || ORDER_SOURCE.WEB;
  // In production, use relative URL to leverage Firebase Hosting rewrites (avoids CSP blocks).
  // In development, use the explicit VITE_API_URL to hit the local/remote Go server directly.
  const isDev = import.meta.env.DEV;
  const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

  const payload = {
    external_id: order.id,
    store_id: SHOP_CONFIG.tenant_id,
    source: source,
    items: order.items.map(i => ({
      name: i.name,
      price_paid: i.price * (i.quantity || 1),
    })),
    customer_name: order.customerName,
    customer_phone: order.customerPhone || '',
    table_number: order.type === 'dine-in' ? (order.table_number || 1) : null,
    apply_service_charge: false,
  };

  let apiSucceeded = false;

  try {
    const res = await fetch(`${apiBase}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      apiSucceeded = true;
    } else {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`API returned ${res.status}: ${errorText}`);
      captureOrderError(new Error(`API ${res.status}: ${errorText}`), order.id, { source });
    }
  } catch (error) {
    console.error("API call failed:", error);
    captureOrderError(error instanceof Error ? error : new Error(String(error)), order.id, { source, phase: 'api_call' });
  }

  // ─── ALWAYS write to Firestore for real-time tracking ───
  // The Go backend's Firestore sync is unreliable (Cloud Run → Firestore auth issues).
  // This guarantees the order appears in the tracking page and admin dashboard instantly.
  try {
    const firestoreOrder: any = {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone || '',
      type: order.type || 'collection',
      items: order.items.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1,
        image: i.image || '/assets/placeholder.png',
      })),
      total: order.total,
      status: source === ORDER_SOURCE.WEB ? 'web_holding' : 'pending',
      source: source,
      tenantId: SHOP_CONFIG.tenant_id, // CRITICAL: Link order to the correct store for Admin Dashboard visibility
      needsPrinting: true, // Queue for Epson SDP
      printed: false,
      timestamp: Timestamp.fromDate(
        order.timestamp instanceof Date ? order.timestamp : new Date(order.timestamp)
      ),
    };

    // Attach client metadata (IP, location) if available
    if ((order as any).clientMeta) {
      firestoreOrder.clientMeta = (order as any).clientMeta;
    }

    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, firestoreOrder);
    console.log(`[Order] Written to Firestore: ${order.id}`);
  } catch (firestoreError) {
    console.error('[Order] Firestore write failed:', firestoreError);
    captureOrderError(firestoreError instanceof Error ? firestoreError : new Error(String(firestoreError)), order.id, { source, phase: 'firestore_write' });
    // If both API and Firestore failed, throw
    if (!apiSucceeded) {
      throw new Error('Order could not be placed. Please check your connection and try again.');
    }
    // API succeeded but Firestore failed — order is in PostgreSQL but not trackable
    // This is acceptable, staff will see it via WhatsApp
  }
}

/**
 * Pushes generic field updates to a specific order.
 */
export async function updateOrderGeneric(id: string, payload: any): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error("Error patching order:", error);
    throw error;
  }
}

/**
 * Updates an order's status.
 */
export async function updateOrderStatusInDb(id: string, status: Order['status']): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/**
 * Subscribes to live order updates from the Go Backend via Native WebSockets.
 */
export function streamOrders(callback: (orders: Order[]) => void): () => void {
  const parseFirestoreOrder = (id: string, data: any): Order => ({
    id: id,
    customerName: data.customerName || data.customer_name || 'Walk-in',
    customerPhone: data.customerPhone || data.customer_phone || '',
    type: data.type || data.order_source || 'collection',
    items: data.items ? data.items.map((i: any) => ({
      name: i.name,
      price: i.price || i.price_paid || 0,
      quantity: i.quantity || 1,
      category: i.category || ''
    })) : [],
    total: data.total || data.gross_total || 0,
    status: data.status,
    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
  });

  // Query orders for this specific tenant without explicit ordering to avoid index requirements
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('tenantId', '==', SHOP_CONFIG.tenant_id)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => parseFirestoreOrder(doc.id, doc.data()))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort desc by time
    callback(orders);
  }, (error) => {
    console.error("[OrderSync] Firestore subscription failed:", error);
    // Fallback to fetch if needed, or just log
  });
}

/**
 * Subscribes to a single live order update from Firestore.
 */
export function streamSingleOrder(id: string, callback: (order: Order | null) => void): () => void {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        ...data,
        id: docSnap.id,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
      } as Order);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error streaming single order:", error);
    callback(null);
  });
}

/**
 * Appends new items to an existing order (Add to Tab)
 */
export async function appendItemsToOrder(orderId: string, newItems: CartItem[]): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Order not found");
    
    const existingOrder = docSnap.data();
    const updatedItems = [...(existingOrder.items || []), ...newItems.map(i => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
      image: i.image || '/assets/placeholder.png',
      isNewAddition: true // Flag to show in KDS that this was just added
    }))];
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Reset status to pending so kitchen sees the new items if they already cleared it
    const newStatus = existingOrder.status === 'ready' ? 'pending' : existingOrder.status;

    await updateDoc(docRef, {
      items: updatedItems,
      total: newTotal,
      status: newStatus
    });
    console.log(`[Order] Appended ${newItems.length} items to tab ${orderId}`);
  } catch (e) {
    console.error("Failed to append items to tab:", e);
    throw e;
  }
}

