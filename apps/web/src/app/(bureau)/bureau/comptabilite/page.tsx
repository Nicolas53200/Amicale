import { GradientHeader } from "@/components/layout/gradient-header";
import { ComptaDashboard } from "@/components/compta/compta-dashboard";

export default function ComptabilitePage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Comptabilité"
        subtitle="Gestion financière de l'amicale"
        backHref="/bureau/dashboard"
      />
      <ComptaDashboard />
    </div>
  );
}
