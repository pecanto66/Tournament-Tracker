
"use client";

import type { User } from 'firebase/auth'; // This import might become unused
import React, { createContext, useContext, useEffect, useState } from 'react';
// Firebase imports removed
// import { auth, googleProvider } from '@/lib/firebase';
// import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null; // Or a simplified user object if not using Firebase User
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Consider a simpler user type or null if no auth
  const [loading, setLoading] = useState(true); // May default to false if no auth operations
  const { toast } = useToast();

  useEffect(() => {
    // Mock loading or remove if no auth initialization
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    toast({ title: "Information", description: "La connexion Google n'est pas configurée." });
    setLoading(false);
  };

  const signOutUser = async () => {
    setUser(null);
    toast({ title: "Information", description: "Déconnexion (locale) effectuée." });
    setLoading(false);
  };

  // If no auth, loading can be defaulted to false
  // and user to null, simplifying the provider.
  // For now, it retains the structure but with stubbed functions.
  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This can be removed if AuthProvider is removed from layout.tsx
    // throw new Error('useAuth must be used within an AuthProvider');
    // Or return a default mock state if AuthProvider is optional
    return { user: null, loading: false, signInWithGoogle: async () => {}, signOutUser: async () => {} };
  }
  return context;
}
