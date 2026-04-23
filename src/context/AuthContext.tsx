import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  loyaltyLinked?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  sendMagicLink: (email: string, name?: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  linkPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAuthLoading: true,
  sendMagicLink: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  linkPhone: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const USERS_COLLECTION = 'users';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const auth = getAuth();

  // ─── Sync Firestore profile on auth change ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Check for existing Firestore profile
        const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        let userData: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        if (userSnap.exists()) {
          const data = userSnap.data();
          userData.phone = data.phone || '';
          userData.loyaltyLinked = data.loyaltyLinked || false;
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // ─── Handle Email Link Sign In ───
  useEffect(() => {
    const handleEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        if (email) {
          try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            const name = window.localStorage.getItem('nameForSignIn');
            const phone = window.localStorage.getItem('phoneForSignIn');
            
            if (name && !result.user.displayName) {
               await updateProfile(result.user, { displayName: name });
            }
            await upsertUserProfile(result.user, phone || undefined);
            
            window.localStorage.removeItem('nameForSignIn');
            window.localStorage.removeItem('phoneForSignIn');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error('Error signing in with email link:', err);
          }
        }
      }
    };
    handleEmailLink();
  }, [auth]);

  // ─── Create or update Firestore user profile ───
  const upsertUserProfile = async (firebaseUser: User, phone?: string) => {
    const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    const existing = await getDoc(userDocRef);
    
    if (existing.exists()) {
      // Update last login
      await updateDoc(userDocRef, { lastLoginAt: new Date().toISOString() });
    } else {
      // Create new profile
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        phone: phone || '',
        loyaltyLinked: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }

    // Auto-link loyalty if phone provided
    if (phone) {
      await linkPhoneToLoyalty(firebaseUser.uid, phone);
    }
  };

  // ─── Link phone-based loyalty to this account ───
  const linkPhoneToLoyalty = async (uid: string, phone: string) => {
    const normPhone = phone.replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
    
    // Check if customer exists in loyalty system
    const customerRef = doc(db, 'customers', normPhone);
    const customerSnap = await getDoc(customerRef);
    
    if (customerSnap.exists()) {
      // Link the account
      await updateDoc(customerRef, { linkedUid: uid, email: user?.email || '' });
      
      // Update user profile
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      await updateDoc(userDocRef, { phone: normPhone, loyaltyLinked: true });
    }
  };

  const sendMagicLink = async (email: string, name?: string, phone?: string) => {
    const actionCodeSettings = {
      // Should point to the homepage or wherever the Auth flow happens
      url: `${window.location.origin}/`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save to local storage for use when they click the link
    window.localStorage.setItem('emailForSignIn', email);
    if (name) window.localStorage.setItem('nameForSignIn', name);
    if (phone) window.localStorage.setItem('phoneForSignIn', phone);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await upsertUserProfile(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const linkPhone = async (phone: string) => {
    if (!user) return;
    const normPhone = phone.replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
    
    // Update user profile
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    await updateDoc(userDocRef, { phone: normPhone });
    
    // Link loyalty
    await linkPhoneToLoyalty(user.uid, normPhone);
    
    setUser(prev => prev ? { ...prev, phone: normPhone, loyaltyLinked: true } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isAuthLoading,
      sendMagicLink,
      loginWithGoogle,
      logout,
      linkPhone,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
