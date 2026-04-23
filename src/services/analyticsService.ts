import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const logTableScan = async (tableNumber: string, userAgent: string) => {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      type: 'table_scan',
      table: tableNumber,
      timestamp: serverTimestamp(),
      userAgent
    });
  } catch (error) {
    console.error('Failed to log table scan:', error);
  }
};

export const logSessionDuration = async (tableNumber: string, durationSeconds: number) => {
  try {
    // Only log meaningful sessions (e.g. > 5 seconds)
    if (durationSeconds < 5) return;
    
    await addDoc(collection(db, 'analytics_events'), {
      type: 'session_end',
      table: tableNumber,
      durationSeconds,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log session duration:', error);
  }
};
