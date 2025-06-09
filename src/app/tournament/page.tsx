
"use client"; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GroupManager } from '@/components/tournament/GroupManager';
import { Loader2 } from 'lucide-react';

export default function TournamentPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-primary">Chargement des données utilisateur...</p>
      </div>
    );
  }

  if (!user) {
    // This will briefly show if not loading and no user, before redirect effect kicks in
    // Or if redirect somehow fails or is delayed.
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
         <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">Redirection vers la page de connexion...</p>
      </div>
    );
  }

  // User is authenticated and not loading
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Gestion Dorra Challenge</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Bienvenue {userProfile?.name || user.displayName || user.email || "Utilisateur"} ! Créez des groupes, ajoutez des équipes, et suivez les matchs et résultats ici.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
