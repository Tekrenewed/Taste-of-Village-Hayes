import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CartItem, TableSession, TableAlert } from '../types';

const SESSIONS_COLLECTION = 'table_sessions';
const ALERTS_COLLECTION = 'table_alerts';

/**
 * Listens for real-time changes to a table's shared session (cart & active order)
 */
export function streamTableSession(tableId: string, callback: (session: TableSession | null) => void) {
  const docRef = doc(db, SESSIONS_COLLECTION, tableId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TableSession);
    } else {
      callback(null);
    }
  });
}

/**
 * Updates the shared cart for a table session
 */
export async function updateTableCart(tableId: string, cart: CartItem[]) {
  const docRef = doc(db, SESSIONS_COLLECTION, tableId);
  await setDoc(docRef, { 
    cart, 
    updatedAt: Timestamp.now(), 
    tableId 
  }, { merge: true });
}

/**
 * Links a successful order to the table session so subsequent orders can "Add to Tab"
 */
export async function setTableActiveOrder(tableId: string, orderId: string | null) {
  const docRef = doc(db, SESSIONS_COLLECTION, tableId);
  await setDoc(docRef, { 
    activeOrderId: orderId, 
    updatedAt: Timestamp.now() 
  }, { merge: true });
}

/**
 * Completely clears a table session (usually after they pay and leave)
 */
export async function clearTableSession(tableId: string) {
  const docRef = doc(db, SESSIONS_COLLECTION, tableId);
  await setDoc(docRef, { 
    cart: [], 
    activeOrderId: null, 
    updatedAt: Timestamp.now() 
  }, { merge: true });
}

/**
 * Sends a ping to the POS for Waiter or Bill
 */
export async function sendTableAlert(tableId: string, type: 'waiter' | 'bill') {
  const alertsRef = collection(db, ALERTS_COLLECTION);
  await addDoc(alertsRef, {
    tableId,
    type,
    status: 'active',
    createdAt: Timestamp.now()
  });
}

/**
 * Streams active table alerts to the POS floorplan
 */
export function streamActiveAlerts(callback: (alerts: TableAlert[]) => void) {
  const q = query(collection(db, ALERTS_COLLECTION), where('status', '==', 'active'));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as TableAlert));
    callback(alerts);
  });
}

/**
 * Dismisses an active alert from the POS
 */
export async function dismissTableAlert(alertId: string) {
  const docRef = doc(db, ALERTS_COLLECTION, alertId);
  await updateDoc(docRef, { status: 'dismissed' });
}
