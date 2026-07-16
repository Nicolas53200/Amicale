import { GradientHeader } from "@/components/layout/gradient-header";
import { TripForm } from "@/components/trips/trip-form";

export default function NouveauVoyagePage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouveau voyage"
        subtitle="Créez un voyage pour votre amicale"
        backHref="/bureau/voyages"
      />
      <TripForm />
    </div>
  );
}
