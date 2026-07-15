import { ComptaDashboard } from "@/components/compta/compta-dashboard";

export default function ComptabilitePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Comptabilité
        </h1>
        <p className="text-sm text-content-secondary">
          Vue globale des opérations comptables de toutes les commissions
        </p>
      </div>
      <ComptaDashboard />
    </div>
  );
}
