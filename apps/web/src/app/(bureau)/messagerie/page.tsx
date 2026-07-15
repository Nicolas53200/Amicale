import { EmptyState } from "@/components/ui/empty-state";

export default function MessageriePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Messagerie</h1>
        <p className="text-sm text-content-secondary">
          Échangez avec les membres de votre amicale
        </p>
      </div>
      <EmptyState
        icon="💬"
        title="Messagerie — Phase 3"
        description="La messagerie sera disponible dans la prochaine phase de développement"
      />
    </div>
  );
}
