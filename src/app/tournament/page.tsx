
"use client"; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GroupManager } from '@/components/tournament/GroupManager';

export default function TournamentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-primary">Chargement des données utilisateur...</p>
      </div>
    );
  }

  if (!user) {
    // This will briefly show if not loading and no user, before redirect effect kicks in
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-muted-foreground">Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Gestion Dorra Challenge</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Bienvenue {user.displayName || "Utilisateur"} ! Créez des groupes, ajoutez des équipes, et suivez les matchs et résultats ici.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
