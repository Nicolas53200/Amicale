export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-500" />
        <p className="text-sm text-content-muted">Chargement...</p>
      </div>
    </div>
  );
}
