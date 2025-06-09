
import * as z from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});
export type SignInFormValues = z.infer<typeof signInSchema>;


export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
