
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from '@/components/Navbar';
// import { AuthProvider } from '@/contexts/AuthContext'; // AuthProvider removed

export const metadata: Metadata = {
  title: 'Dorra Challenge',
  description: 'Application de suivi de tournois pour gérer les tournois de football, les équipes, les matchs et les statistiques des joueurs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {/* <AuthProvider> AuthProvider removed */}
          <header className="no-print">
            <Navbar />
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <Toaster />
        {/* </AuthProvider> AuthProvider removed */}
      </body>
    </html>
  );
}
