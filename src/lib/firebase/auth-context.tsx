'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types/models';
import { UserProfile } from '@/types/database';
import { UserService } from './firestore';
import { useMockFirebase, mockUser, mockUserData } from './mock-config';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null; // 後方互換性のため保持
  userProfile: UserProfile | null; // 新しいプロフィール構造
  loading: boolean;
  signup: (email: string, password: string, displayName: string, additionalData?: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null); // 後方互換性
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (userId: string) => {
    try {
      const profile = await UserService.getUser(userId);
      if (profile) {
        setUserProfile(profile);
        // 後方互換性のため古い形式も設定
        setUserData({
          id: userId,
          email: profile.email,
          name: profile.displayName || profile.firstName || 'ユーザー',
          birthYear: profile.age ? new Date().getFullYear() - profile.age : undefined,
          diagnoses: {}, // 後で診断データを取得
          preferences: {
            priceRange: [3000, 10000],
            preferredArea: []
          }
        } as User);
      }
      
      // ログイン時刻を更新
      await UserService.updateLastLogin(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Sign up new user
  const signup = async (
    email: string, 
    password: string, 
    displayName: string, 
    additionalData?: Partial<UserProfile>
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      await UserService.createUser(user.uid, {
        email,
        displayName,
        photoURL: user.photoURL,
        ...additionalData
      });

      // Fetch the created user data
      await fetchUserData(user.uid);
    } catch (error) {
      throw error;
    }
  };

  // Sign in existing user
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Check if user profile exists
      const existingProfile = await UserService.getUser(user.uid);
      
      if (!existingProfile) {
        // Create new user profile for Google sign-in
        await UserService.createUser(user.uid, {
          email: user.email || '',
          displayName: user.displayName || 'ユーザー',
          photoURL: user.photoURL,
          age: 25 // Default age
        });
      }

      await fetchUserData(user.uid);
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      await UserService.updateUser(currentUser.uid, updates);
      
      // Refresh user data
      await fetchUserData(currentUser.uid);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    // テストモードまたはモック環境の場合
    if (process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === 'true' || useMockFirebase) {
      setCurrentUser(mockUser as any);
      setUserData(mockUserData as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};