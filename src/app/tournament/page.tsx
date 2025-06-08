
"use client"; // This page needs to be a client component for auth checks

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
    return <div className="flex justify-center items-center min-h-screen"><p>جار تحميل بيانات المستخدم...</p></div>;
  }

  if (!user) {
     return <div className="flex justify-center items-center min-h-screen"><p>الرجاء تسجيل الدخول للمتابعة.</p></div>;
  }

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
