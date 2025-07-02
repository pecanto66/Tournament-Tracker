"use client";

import Link from 'next/link';
import { Trophy, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-2xl font-headline hover:opacity-90 transition-opacity">
          <Trophy className="h-8 w-8 text-accent" />
          <span>Dorra Challenge</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hover:text-accent transition-colors text-base font-medium text-primary-foreground hover:bg-primary/80">
            <Link href="/">
              <Home className="ml-1.5 h-5 w-5" />
              Accueil
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hover:text-accent transition-colors text-base font-medium text-primary-foreground hover:bg-primary/80">
            <Link href="/tournament">
              <Trophy className="ml-1.5 h-5 w-5" />
              Tournois
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
