import { GradientHeader } from "@/components/layout/gradient-header";
import { EventForm } from "@/components/events/event-form";

export default function NouvelEvenementPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouvel événement"
        subtitle="Créez un événement pour votre amicale"
        backHref="/bureau/evenements"
      />
      <EventForm />
    </div>
  );
}
