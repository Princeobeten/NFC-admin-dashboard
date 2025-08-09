"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/hooks/firebase';

// Define types for our context
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL?: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  authError: string | null;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  isLoading: true,
  authError: null,
});

// Define the type for Firestore user data
type UserData = {
  role: string;
  name?: string;
  email?: string;
  createdAt?: string;
  [key: string]: any; // For any additional fields
};

// Convert Firebase user to our User type
const formatUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get additional user data from Firestore
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  let userData: UserData = {
    role: 'staff' // Default role
  };
  
  if (userSnap.exists()) {
    userData = { ...userData, ...userSnap.data() as UserData };
  }
  
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || userData.name || 'User',
    email: firebaseUser.email || '',
    role: userData.role,
    photoURL: firebaseUser.photoURL
  };
};

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          const formattedUser = await formatUser(firebaseUser);
          setUser(formattedUser);
          localStorage.setItem('acss_user', JSON.stringify(formattedUser));
        } catch (error) {
          console.error('Error formatting user:', error);
          setAuthError('Error loading user profile');
        }
      } else {
        setUser(null);
        localStorage.removeItem('acss_user');
      }
      
      setIsLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const formattedUser = await formatUser(userCredential.user);
      setUser(formattedUser);
      localStorage.setItem('acss_user', JSON.stringify(formattedUser));
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error.message || 'Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        role: 'staff', // Default role for new users
        createdAt: new Date().toISOString()
      });
      
      // Format and set user
      const formattedUser = await formatUser(firebaseUser);
      setUser(formattedUser);
      localStorage.setItem('acss_user', JSON.stringify(formattedUser));
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(error.message || 'Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('acss_user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
