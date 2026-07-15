"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-secondary px-4 text-center">
      <span className="text-6xl">⚠️</span>
      <h1 className="text-2xl font-bold text-content-primary">
        Une erreur est survenue
      </h1>
      <p className="max-w-md text-sm text-content-secondary">
        {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
