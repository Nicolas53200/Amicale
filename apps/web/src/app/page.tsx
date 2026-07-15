import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-content-primary sm:text-5xl">
          Amicale
        </h1>
        <p className="mt-3 text-lg text-content-secondary">
          La plateforme de gestion pour votre amicale de sapeurs-pompiers
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Se connecter</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/invitation">Rejoindre avec un code</Link>
        </Button>
      </div>
    </div>
  );
}
