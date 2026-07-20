"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-6xl">📡</span>
        <h1 className="text-2xl font-bold text-content-primary">
          Hors connexion
        </h1>
        <p className="max-w-sm text-sm text-content-secondary">
          Vous n&apos;êtes pas connecté à Internet. Vérifiez votre connexion et
          réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 active:bg-brand-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
