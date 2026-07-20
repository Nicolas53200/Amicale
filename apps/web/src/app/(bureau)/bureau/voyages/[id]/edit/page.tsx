import { notFound } from "next/navigation";
import { getTrip } from "@/lib/actions/trips";
import { GradientHeader } from "@/components/layout/gradient-header";
import { TripForm } from "@/components/trips/trip-form";

export default async function EditVoyagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let trip;
  try {
    trip = await getTrip(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Modifier le voyage"
        subtitle={trip.destination}
        backHref={`/bureau/voyages/${id}`}
      />
      <TripForm trip={trip} />
    </div>
  );
}
