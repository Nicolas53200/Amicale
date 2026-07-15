import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-secondary px-4 text-center">
      <span className="text-6xl">🔍</span>
      <h1 className="text-2xl font-bold text-content-primary">Page introuvable</h1>
      <p className="max-w-md text-sm text-content-secondary">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/amicaliste/accueil">Accueil</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/bureau/dashboard">Bureau</Link>
        </Button>
      </div>
    </div>
  );
}
