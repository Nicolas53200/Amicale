import { EmptyState } from "@/components/ui/empty-state";

export default function VoyagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Voyages</h1>
        <p className="text-sm text-content-secondary">
          Les voyages proposés par votre amicale
        </p>
      </div>
      <EmptyState
        icon="✈️"
        title="Voyages — Phase 3"
        description="Les voyages et inscriptions seront disponibles dans la prochaine phase"
      />
    </div>
  );
}
