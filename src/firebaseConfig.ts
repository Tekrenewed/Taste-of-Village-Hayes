import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Taste Of Village Hayes Firebase project configuration
const firebaseConfig = {
  projectId: "hootsnkeks-36451",
  appId: "1:11654020842:web:1f6a8a60b3ff386a62a193",
  storageBucket: "hootsnkeks-36451.firebasestorage.app",
  apiKey: "AIzaSyBcJDYSJg5fauDSnbWHZ_NEt_Mlk91WVqQ",
  authDomain: "hootsnkeks-36451.firebaseapp.com",
  messagingSenderId: "11654020842",
  measurementId: "G-YW1MYGEG93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline caching ("30-second blip protection")
// This allows the POS to locally queue writes if the internet drops briefly.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence: Multiple tabs open, only enabled in one.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence: Browser unsupported.');
  }
});

export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Cloud Messaging and get a reference to the service
import { getMessaging, isSupported } from 'firebase/messaging';

export const messagingPromise = isSupported().then(supported => {
  if (supported) {
    return getMessaging(app);
  }
  return null;
});
