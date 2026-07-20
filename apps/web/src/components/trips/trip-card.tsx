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
  basePath = "/amicaliste/voyages",
}: TripCardProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isFull = maxSeats ? registrationCount >= maxSeats : false;

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex flex-col overflow-hidden rounded-[16px] bg-surface-elevated shadow-sm transition-shadow active:scale-[0.98]"
    >
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-4xl dark:from-blue-500/20 dark:to-blue-600/20">
        ✈️
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <h3 className="text-[14px] font-semibold text-content-primary">
          {destination}
        </h3>
        <p className="text-[12px] text-content-muted">
          {start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          {" → "}
          {end.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          {" · "}
          {days} jour{days > 1 ? "s" : ""}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="default">
            {fmt(parseFloat(priceAdult))}/pers.
          </Badge>
          <span className="text-[11px] text-content-muted">
            {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
            {maxSeats && ` / ${maxSeats}`}
          </span>
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>
    </Link>
  );
}
