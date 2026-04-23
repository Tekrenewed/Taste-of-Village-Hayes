import { getToken } from 'firebase/messaging';
import { messagingPromise, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Requests notification permissions from the user and retrieves the FCM token.
 * Optionally saves the token to the given order document.
 */
export const requestPushPermission = async (orderId?: string): Promise<string | null> => {
  try {
    const messaging = await messagingPromise;
    if (!messaging) {
      console.warn('[PushService] Messaging not supported by browser.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // NOTE: For production, you must generate a VAPID key pair in the Firebase Console
      // (Project Settings > Cloud Messaging > Web configuration)
      // and pass it here: getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' })
      const token = await getToken(messaging);
      
      if (token) {
        console.log('[PushService] Got FCM token:', token);
        
        // If an order ID is provided, save the token to the order so the backend knows where to push
        if (orderId) {
          await updateDoc(doc(db, 'orders', orderId), {
            fcmToken: token
          });
          console.log('[PushService] Token saved to order', orderId);
        }
        
        return token;
      } else {
        console.log('[PushService] No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('[PushService] Notification permission not granted.');
    }
  } catch (error) {
    console.error('[PushService] Error requesting push permissions:', error);
  }
  
  return null;
};
