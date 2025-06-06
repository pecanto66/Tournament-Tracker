import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // For RTL, ArrowLeft points "forward"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
      <h1 className="text-5xl font-headline font-bold text-primary mb-6">
        مرحباً بك في دورة التحدي!
      </h1>
      <p className="text-xl text-foreground mb-10 max-w-2xl">
        نظّم بطولات كرة القدم بسهولة. قم بإنشاء المجموعات، وإضافة الفرق، وتتبع المباريات والنتائج، وإدارة إحصائيات اللاعبين في مكان واحد.
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
        <Link href="/tournament">
          ابدأ تنظيم البطولة
          <ArrowLeft className="mr-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
