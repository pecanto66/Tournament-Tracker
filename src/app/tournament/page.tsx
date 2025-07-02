
import { GroupManager } from '@/components/tournament/GroupManager';

export default function TournamentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Gestion Dorra Challenge</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Bienvenue ! Créez des groupes, ajoutez des équipes, et suivez les matchs et résultats ici.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
