import { notFound } from "next/navigation";
import { getEvent } from "@/lib/actions/events";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EventForm } from "@/components/events/event-form";

export default async function EditEvenementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event;
  try {
    event = await getEvent(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Modifier l'événement"
        subtitle={event.title}
        backHref={`/bureau/evenements/${id}`}
      />
      <EventForm event={event} />
    </div>
  );
}
