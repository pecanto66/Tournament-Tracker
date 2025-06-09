
"use client";

import type { User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase'; // db is needed for storing user info
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import type { SignInFormValues, SignUpFormValues, UserProfile } from '@/types/auth';


interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (data: SignInFormValues) => Promise<void>;
  signUpWithEmail: (data: SignUpFormValues) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
           // This case might happen if user exists in Auth but not in Firestore 'users'
           // Potentially create it or handle as an anomaly if sign-up didn't complete for Firestore.
           // For now, if display name is available, use it.
           const fallbackProfile: UserProfile = { 
             uid: currentUser.uid, 
             name: currentUser.displayName || "", 
             email: currentUser.email || "", 
             role: "user"
           };
          setUserProfile(fallbackProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (data: SignInFormValues) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Succès", description: "Connexion réussie !" });
      // User state and profile will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error("Error signing in: ", error.code, error.message);
      let errorMessage = "Une erreur s'est produite lors de la connexion.";
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        errorMessage = "Adresse e-mail ou mot de passe incorrect. Veuillez vérifier vos informations et réessayer.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Le format de l'adresse e-mail est invalide.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "Ce compte utilisateur a été désactivé.";
      } else {
        errorMessage = "Impossible de se connecter. Veuillez réessayer plus tard."; // Generic fallback for other errors
      }
      toast({ title: "Erreur de connexion", description: errorMessage, variant: "destructive" });
      throw new Error(errorMessage); // Re-throw the user-friendly message to handle in form
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (data: SignUpFormValues) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(newUser, { displayName: data.name });

      // Store additional user info in Firestore
      const userDocRef = doc(db, "users", newUser.uid);
      const profileData: UserProfile = {
        uid: newUser.uid,
        name: data.name,
        email: data.email,
        role: "user", // Default role
      };
      await setDoc(userDocRef, profileData);
      
      // Manually set user and profile here to ensure UI updates immediately
      // as onAuthStateChanged might have a slight delay
      setUser(newUser); 
      setUserProfile(profileData);

      toast({ title: "Succès", description: "Inscription réussie ! Vous êtes maintenant connecté." });
      // User state will be updated by onAuthStateChanged, redirect will occur on page
    } catch (error: any) {
      console.error("Error signing up: ", error.code, error.message);
      let errorMessage = "Une erreur s'est produite lors de l'inscription.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse e-mail est déjà utilisée.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Le format de l'adresse e-mail est invalide.";
      } else {
        errorMessage = "Impossible de créer le compte. Veuillez réessayer plus tard."; // Generic fallback
      }
      toast({ title: "Erreur d'inscription", description: errorMessage, variant: "destructive" });
      throw new Error(errorMessage); // Re-throw user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // setUser and setUserProfile will be set to null by onAuthStateChanged
      toast({ title: "Déconnexion", description: "Vous avez été déconnecté." });
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ title: "Erreur de déconnexion", description: "Une erreur s'est produite lors de la déconnexion.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithEmail, signUpWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
