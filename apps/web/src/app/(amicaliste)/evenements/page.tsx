import { EmptyState } from "@/components/ui/empty-state";

export default function EvenementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Événements
        </h1>
        <p className="text-sm text-content-secondary">
          Les événements de votre amicale
        </p>
      </div>
      <EmptyState
        icon="🎉"
        title="Événements — Phase 3"
        description="Les événements et inscriptions seront disponibles dans la prochaine phase"
      />
    </div>
  );
}
