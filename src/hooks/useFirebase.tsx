import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, loginWithGoogle, loginWithGoogleRedirect, logout, syncUserProfile } from '../services/firebase';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  error: any | null;
  login: () => Promise<User | null>;
  loginRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    // Process redirect sign-in result if returning from a redirect flow
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncUserProfile(result.user);
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error('Redirect sign-in error:', err);
        setError(err);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setError(null);
    try {
      const loggedUser = await loginWithGoogle();
      return loggedUser;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const handleLoginRedirect = async () => {
    setError(null);
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        loginRedirect: handleLoginRedirect,
        logout,
        clearError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

