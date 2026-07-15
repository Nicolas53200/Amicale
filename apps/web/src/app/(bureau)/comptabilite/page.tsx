import { ComptaDashboard } from "@/components/compta/compta-dashboard";
import { ExportButton } from "@/components/ui/export-button";
import { exportAccounting } from "@/lib/actions/export";

export default function ComptabilitePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            Comptabilité
          </h1>
          <p className="text-sm text-content-secondary">
            Vue globale des opérations comptables de toutes les commissions
          </p>
        </div>
        <ExportButton
          label="Exporter CSV"
          filename="comptabilite.csv"
          exportFn={exportAccounting}
        />
      </div>
      <ComptaDashboard />
    </div>
  );
}
