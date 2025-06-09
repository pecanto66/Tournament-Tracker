
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import type { SignUpFormValues } from '@/types/auth';


const signUpSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

export default function SignUpPage() {
  const { user, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/tournament');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      await signUpWithEmail(data);
      // Redirect is handled by useEffect
    } catch (error: any) {
       setError("root.serverError", {
        type: "manual",
        message: error.message || "Une erreur s'est produite lors de l'inscription.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <p className="text-xl text-primary">Chargement...</p>
      </div>
    );
  }
  
  if (user && !loading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <p className="text-xl text-primary">Redirection vers le tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-accent/20 via-background to-primary/20 p-6 text-center">
      <Card className="p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
        <Image 
            src="https://drive.google.com/uc?id=10urDu43fgX0_PBwx59Lmb1NaC4FW5baz" 
            alt="Dorra Challenge Logo" 
            width={100} 
            height={100} 
            className="mx-auto mb-6 rounded-full border-4 border-accent shadow-lg"
            data-ai-hint="trophy logo"
        />
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-3xl font-headline font-bold text-accent text-center">Créer un compte</CardTitle>
          <CardDescription className="text-center mt-2">
            Rejoignez Dorra Challenge et commencez à gérer vos tournois.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Nom complet</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Votre nom" 
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="vous@exemple.com" 
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Au moins 6 caractères" 
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            {errors.root?.serverError && <p className="text-destructive text-sm">{errors.root.serverError.message}</p>}
            <Button type="submit" size="lg" className="w-full font-semibold text-base py-3 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "S'inscrire"} <UserPlus className="mr-2 h-5 w-5" />
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Button variant="link" asChild className="p-0 text-accent hover:underline">
              <Link href="/login">Connectez-vous ici</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-foreground/80">
        Application Dorra Challenge &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
