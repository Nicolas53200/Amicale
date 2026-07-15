import { TripForm } from "@/components/trips/trip-form";

export default function NouveauVoyagePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Nouveau voyage
        </h1>
        <p className="text-sm text-content-secondary">
          Créez un nouveau voyage pour votre amicale
        </p>
      </div>
      <TripForm />
    </div>
  );
}
