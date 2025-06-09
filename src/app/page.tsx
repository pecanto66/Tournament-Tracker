
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // For a loading spinner

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/tournament'); // Use replace to avoid back button to this loading page
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Display a loading indicator while checking auth state
  // Or, if loading completes and redirects haven't happened yet
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-xl text-muted-foreground">Chargement de l'application...</p>
    </div>
  );
}
