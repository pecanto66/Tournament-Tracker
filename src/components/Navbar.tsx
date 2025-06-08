
"use client";

import Link from 'next/link';
import { Trophy, Home, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-2xl font-headline hover:opacity-90 transition-opacity">
          <Trophy className="h-8 w-8 text-accent" />
          <span>دورة التحدي</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-base font-medium hover:text-accent transition-colors">
            <Home className="h-5 w-5" />
            الرئيسية
          </Link>
          <Link href="/tournament" className="flex items-center gap-1.5 text-base font-medium hover:text-accent transition-colors">
            البطولات
          </Link>
          {loading ? (
            <span className="text-sm">جار التحميل...</span>
          ) : user ? (
            <>
              <span className="text-sm flex items-center gap-1">
                <UserCircle className="h-5 w-5" />
                {user.displayName || user.email}
              </span>
              <Button onClick={signOutUser} variant="ghost" size="sm" className="hover:bg-accent/20 hover:text-accent">
                <LogOut className="ml-1 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <Button onClick={signInWithGoogle} variant="ghost" size="sm" className="hover:bg-accent/20 hover:text-accent">
              <LogIn className="ml-1 h-4 w-4" />
              تسجيل الدخول
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
