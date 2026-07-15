import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TripCardProps {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  priceAdult: string;
  maxSeats?: number | null;
  registrationCount: number;
  imageUrl?: string | null;
  basePath?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function TripCard({
  id,
  destination,
  startDate,
  endDate,
  priceAdult,
  maxSeats,
  registrationCount,
  imageUrl,
  basePath = "/amicaliste/voyages",
}: TripCardProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isFull = maxSeats ? registrationCount >= maxSeats : false;

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated transition-shadow hover:shadow-md"
    >
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-4xl dark:from-brand-500/20 dark:to-brand-600/20">
        ✈️
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-content-primary group-hover:text-brand-500">
          {destination}
        </h3>
        <p className="text-xs text-content-muted">
          {start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          {" → "}
          {end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          {" · "}
          {days} jour{days > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="default">
            {fmt(parseFloat(priceAdult))}/pers.
          </Badge>
          <span className="text-xs text-content-muted">
            {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
            {maxSeats && ` / ${maxSeats}`}
          </span>
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>
    </Link>
  );
}
