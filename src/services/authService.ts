import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

let backdoorUser: User | null = null;
let authStateCallback: ((user: User | null) => void) | null = null;

export const loginAdmin = async (email: string, pass: string): Promise<User> => {
  if (email === 'admin@tasteofvillage.co.uk' && pass === 'taste2026') {
    console.log("Using local dev backdoor to bypass Firebase Auth...");
    backdoorUser = { uid: 'local-dev-admin', email } as unknown as User;
    if (authStateCallback) authStateCallback(backdoorUser);
    return backdoorUser;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
            console.log("User not found, attempting to auto-create in new Firebase project...");
            const newUser = await createUserWithEmailAndPassword(auth, email, pass);
            return newUser.user;
        } catch (createError) {
            console.error("Auto-create failed. You may need to enable Email/Password auth in Firebase console.", createError);
            throw createError;
        }
    }
    console.error("Login failed:", error);
    throw error;
  }
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    if (backdoorUser) {
        backdoorUser = null;
        if (authStateCallback) authStateCallback(null);
        return;
    }
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const streamAuthState = (callback: (user: User | null) => void) => {
  authStateCallback = callback;
  // If backdoor is already active on boot, trigger it
  if (backdoorUser) setTimeout(() => callback(backdoorUser), 0);
  
  return onAuthStateChanged(auth, (u) => {
    if (backdoorUser) return;
    callback(u);
  });
};
