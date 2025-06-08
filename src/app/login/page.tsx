
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/tournament');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>جار التحميل...</p></div>;
  }

  if (user) {
     return <div className="flex justify-center items-center min-h-screen"><p>يتم توجيهك...</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <h1 className="text-4xl font-headline font-bold text-primary mb-8">تسجيل الدخول</h1>
      <p className="text-lg text-foreground mb-8">
        الرجاء تسجيل الدخول للمتابعة إلى لوحة تحكم البطولة.
      </p>
      <Button onClick={signInWithGoogle} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
        <LogIn className="ml-2 h-5 w-5" /> تسجيل الدخول باستخدام جوجل
      </Button>
    </div>
  );
}
