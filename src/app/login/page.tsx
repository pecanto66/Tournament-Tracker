
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/tournament');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <p className="text-xl text-primary">Chargement...</p>
      </div>
    );
  }

  if (user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <p className="text-xl text-primary">Redirection vers le tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6 text-center">
      <div className="bg-card p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
        <Image 
            src="https://placehold.co/150x150.png" 
            alt="Tournament Tracker Logo" 
            width={120} 
            height={120} 
            className="mx-auto mb-6 rounded-full border-4 border-primary shadow-lg"
            data-ai-hint="trophy logo" 
        />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Dorra Challenge</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Bienvenue ! Veuillez vous connecter pour continuer.
        </p>
        <Button onClick={signInWithGoogle} size="lg" className="w-full font-semibold text-base py-3 bg-accent hover:bg-accent/90 text-accent-foreground">
          <LogIn className="ml-2 h-5 w-5" /> Se connecter avec Google
        </Button>
         <p className="text-xs text-muted-foreground mt-8">
          En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>
       <p className="mt-8 text-sm text-foreground/80">
        Application Dorra Challenge &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
