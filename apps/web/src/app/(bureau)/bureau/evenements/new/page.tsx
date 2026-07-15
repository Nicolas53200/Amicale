import { EventForm } from "@/components/events/event-form";

export default function NouvelEvenementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Nouvel événement
        </h1>
        <p className="text-sm text-content-secondary">
          Créez un nouvel événement pour votre amicale
        </p>
      </div>
      <EventForm />
    </div>
  );
}
