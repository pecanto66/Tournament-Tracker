import Link from 'next/link';
import { Trophy, Home } from 'lucide-react';

export function Navbar() {
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
        </div>
      </div>
    </header>
  );
}
