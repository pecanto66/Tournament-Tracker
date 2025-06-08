
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
        <p className="text-xl text-primary">جار تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally not be reached due to the redirect,
    // but it's good practice for robustness.
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-muted-foreground">الرجاء تسجيل الدخول لعرض هذه الصفحة.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">إدارة دورة التحدي</h1>
        <p className="text-lg text-muted-foreground mt-2">
          مرحباً {user.displayName || 'المستخدم'}! قم بإنشاء المجموعات، وإضافة الفرق، وتتبع المباريات والنتائج هنا.
        </p>
      </header>
      <GroupManager />
    </div>
  );
}
