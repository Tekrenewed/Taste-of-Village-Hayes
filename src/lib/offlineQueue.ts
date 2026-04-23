/**
 * Offline Queue — IndexedDB-backed order queue for POS resilience.
 * 
 * When Firestore writes fail (e.g., WiFi is down), orders are stored
 * in IndexedDB and automatically synced when connectivity returns.
 * 
 * Uses the raw IndexedDB API (no dependencies) to keep the bundle small.
 */

const DB_NAME = 'taste-of-village_pos_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_orders';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Queue a failed order for later sync */
export async function queueOrder(order: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      ...order,
      _queuedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => {
      console.log(`[OfflineQueue] Order ${order.id} queued in IndexedDB`);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all queued orders */
export async function getQueuedOrders(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/** Remove a successfully synced order from the queue */
export async function removeFromQueue(orderId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(orderId);
    tx.oncomplete = () => {
      console.log(`[OfflineQueue] Order ${orderId} removed from queue (synced)`);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/** Get count of pending offline orders */
export async function getQueueLength(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
