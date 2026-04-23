import { get, set } from 'idb-keyval';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

const SYNC_QUEUE_KEY = 'restaurant_os_sync_queue';

export interface QueuedAction {
  id: string;
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CREATE_BOOKING';
  payload: any;
  timestamp: number;
  retryCount: number;
}

/**
 * Pushes an action to the local IndexedDB queue for offline resilience.
 * Useful when the Go API is completely unreachable.
 */
export async function enqueueAction(action: Omit<QueuedAction, 'timestamp' | 'retryCount' | 'id'>) {
  const queue: QueuedAction[] = (await get(SYNC_QUEUE_KEY)) || [];
  
  const newAction: QueuedAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  };
  
  queue.push(newAction);
  await set(SYNC_QUEUE_KEY, queue);
  console.warn(`[OfflineSync] Action queued for background sync: ${action.type}`);

  // Try syncing immediately in case it was just a transient glitch
  attemptSync();
}

/**
 * Attempts to replay all queued actions against the Go API.
 */
export async function attemptSync() {
  if (!navigator.onLine) {
    console.log('[OfflineSync] Offline, skipping sync.');
    return;
  }

  const queue: QueuedAction[] = (await get(SYNC_QUEUE_KEY)) || [];
  if (queue.length === 0) return;

  console.log(`[OfflineSync] Attempting to sync ${queue.length} queued actions...`);
  
  const isDev = import.meta.env.DEV;
  const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';

  const remainingQueue: QueuedAction[] = [];

  for (const action of queue) {
    try {
      let endpoint = '';
      let method = '';

      if (action.type === 'CREATE_ORDER') {
        endpoint = '/api/v1/orders';
        method = 'POST';
      } else if (action.type === 'UPDATE_ORDER') {
        endpoint = `/api/v1/orders/${action.payload.orderId}`;
        method = 'PATCH';
      } else if (action.type === 'CREATE_BOOKING') {
        endpoint = '/api/v1/bookings';
        method = 'POST';
      }

      const res = await fetch(`${apiBase}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload.data || action.payload),
      });

      if (!res.ok) {
        throw new Error(`Sync failed with status ${res.status}`);
      }

      console.log(`[OfflineSync] Successfully synced action: ${action.type}`);
    } catch (err) {
      console.error(`[OfflineSync] Failed to sync action: ${action.type}`, err);
      
      // If it fails, keep it in the queue, increment retry
      action.retryCount++;
      // Give up after 10 retries (~hours of being offline/broken) to prevent infinite loops
      if (action.retryCount < 10) {
        remainingQueue.push(action);
      } else {
        console.error(`[OfflineSync] Dropping action after 10 failed retries:`, action);
      }
    }
  }

  // Save the remaining (failed) items back to IndexedDB
  await set(SYNC_QUEUE_KEY, remainingQueue);
}

// Automatically listen for browser coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', attemptSync);
  
  // Also try syncing periodically (every 2 minutes) just in case the online event was missed
  setInterval(attemptSync, 2 * 60 * 1000);
}
