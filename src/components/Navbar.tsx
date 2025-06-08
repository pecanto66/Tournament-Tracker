
"use client";

import Link from 'next/link';
import { Trophy, Home, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-2xl font-headline hover:opacity-90 transition-opacity">
          <Trophy className="h-8 w-8 text-accent" />
          <span>Dorra Challenge</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-base font-medium hover:text-accent transition-colors">
            <Home className="h-5 w-5" />
            Accueil
          </Link>
          <Link href="/tournament" className="flex items-center gap-1.5 text-base font-medium hover:text-accent transition-colors">
            Tournois
          </Link>
          {loading ? (
            <div className="text-sm">Chargement...</div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/80">
                  <Avatar className="h-9 w-9 border-2 border-accent">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "Utilisateur"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOutUser} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="ml-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signInWithGoogle} variant="secondary" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <LogIn className="ml-2 h-4 w-4" />
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
