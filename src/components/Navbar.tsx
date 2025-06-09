
"use client";

import Link from 'next/link';
import { Trophy, Home, LogIn, LogOut, UserCircle, UserPlus } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, userProfile, signOutUser, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login'); // Redirect to login after sign out
  };

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
          {user && (
            <Button variant="ghost" asChild className="hover:text-accent transition-colors text-base font-medium text-primary-foreground hover:bg-primary/80">
               <Link href="/tournament">
                <Trophy className="ml-1.5 h-5 w-5" />
                Tournois
              </Link>
            </Button>
          )}
          
          {loading ? (
            <div className="text-sm">Chargement...</div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-primary/80">
                  <Avatar className="h-9 w-9 border-2 border-accent">
                    {/* Assuming user.photoURL might not exist with email/password */}
                    {/* <AvatarImage src={user.photoURL || undefined} alt={userProfile?.name || user.email || "User"} /> */}
                    <AvatarFallback>
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserCircle />)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.name || user.displayName || "Utilisateur"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="ml-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="secondary" size="sm" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 <Link href="/login">
                    <LogIn className="ml-2 h-4 w-4" />
                    Se connecter
                </Link>
              </Button>
               <Button variant="outline" size="sm" asChild className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                 <Link href="/signup">
                    <UserPlus className="ml-2 h-4 w-4" />
                    S'inscrire
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
