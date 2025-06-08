
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
        <p className="text-xl text-primary">جار التحميل...</p>
      </div>
    );
  }

  if (user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <p className="text-xl text-primary">يتم توجيهك إلى لوحة التحكم...</p>
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
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">دورة التحدي</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          مرحباً بك! الرجاء تسجيل الدخول للمتابعة.
        </p>
        <Button onClick={signInWithGoogle} size="lg" className="w-full font-semibold text-base py-3 bg-accent hover:bg-accent/90 text-accent-foreground">
          <LogIn className="ml-2 h-5 w-5" /> تسجيل الدخول باستخدام جوجل
        </Button>
         <p className="text-xs text-muted-foreground mt-8">
          بتسجيل الدخول، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
        </p>
      </div>
       <p className="mt-8 text-sm text-foreground/80">
        تطبيق دورة التحدي &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
