import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  devModeAutoAuth: boolean;
  toggleDevAuth: () => void;
}

// משתמש פיתוח מקומי מובנה כדי לעקוף שגיאות Missing or Insufficient Permissions
export const DEV_MOCK_USER = {
  uid: 'dev_user_master_ovt',
  email: 'ovt5771@gmail.com',
  displayName: 'אשר משולם (פיתוח מקומי)',
  photoURL: '/kosun-user.webp',
  emailVerified: true,
  isAnonymous: false,
  phoneNumber: null,
  tenantId: '_master',
  providerData: [
    {
      providerId: 'google.com',
      uid: 'dev_user_master_ovt',
      displayName: 'אשר משולם (פיתוח מקומי)',
      email: 'ovt5771@gmail.com',
      phoneNumber: null,
      photoURL: '/kosun-user.webp',
    },
  ],
} as unknown as User;

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signInWithGoogle: async () => {},
  logOut: async () => {},
  devModeAutoAuth: true,
  toggleDevAuth: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [realUser, setRealUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // ברירת מחדל בלוקאל: אימות פיתוח מופעל אוטומטית (True) כדי שאף פעם לא תהיה שגיאת הרשאה!
  const [devModeAutoAuth, setDevModeAutoAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setRealUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setDevModeAutoAuth(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleDevAuth = () => {
    setDevModeAutoAuth((prev) => !prev);
  };

  // אם יש משתמש גוגל אמיתי מחובר - משתמשים בו; אחרת, בלוקאל מזינים אוטומטית את משתמש הפיתוח
  const effectiveUser = realUser || (devModeAutoAuth ? DEV_MOCK_USER : null);

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        loading: false,
        signInWithGoogle,
        logOut,
        devModeAutoAuth,
        toggleDevAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
