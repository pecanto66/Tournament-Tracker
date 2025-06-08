
"use client"; 

// import { useEffect } from 'react'; // useEffect might be needed for other things
// import { useRouter } from 'next/navigation'; // useRouter might be needed for other things
// import { useAuth } from '@/contexts/AuthContext'; // useAuth removed
import { GroupManager } from '@/components/tournament/GroupManager';

export default function TournamentPage() {
  // const { user, loading } = useAuth(); // Auth logic removed
  // const router = useRouter(); // Potentially unused now

  // useEffect(() => { // Auth redirect logic removed
  //   if (!loading && !user) {
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  // if (loading) { // Auth loading state removed
  //   return (
  //     <div className="container mx-auto px-4 py-8 text-center">
  //       <p className="text-xl text-primary">Chargement des données utilisateur...</p>
  //     </div>
  //   );
  // }

  // if (!user) { // Auth check removed
  //   return (
  //     <div className="container mx-auto px-4 py-8 text-center">
  //       <p className="text-xl text-muted-foreground">Veuillez vous connecter pour afficher cette page.</p>
  //     </div>
  //   );
  // }

  const userDisplayName = "Utilisateur"; // Mock display name

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Gestion Dorra Challenge</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Bienvenue {userDisplayName} ! Créez des groupes, ajoutez des équipes, et suivez les matchs et résultats ici.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
