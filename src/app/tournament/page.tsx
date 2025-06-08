
"use client"; 

// Removed useEffect, useRouter, useAuth
import { GroupManager } from '@/components/tournament/GroupManager';

export default function TournamentPage() {
  // Removed user, loading, router variables and useEffect for auth check

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">إدارة دورة التحدي</h1>
        <p className="text-lg text-muted-foreground mt-2">
          قم بإنشاء المجموعات، وإضافة الفرق، وتتبع المباريات والنتائج هنا.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
