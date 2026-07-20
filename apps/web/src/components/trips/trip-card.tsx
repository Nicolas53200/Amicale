import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TripCardProps {
  id: string;
  name?: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  priceAdult: string;
  maxSeats?: number | null;
  registrationCount: number;
  color?: string | null;
  transport?: string | null;
  basePath?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function TripCard({
  id,
  name,
  destination,
  startDate,
  endDate,
  priceAdult,
  maxSeats,
  registrationCount,
  color,
  transport,
  basePath = "/amicaliste/voyages",
}: TripCardProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isFull = maxSeats ? registrationCount >= maxSeats : false;

  const bgStyle = color
    ? { background: `linear-gradient(135deg, ${color}e6 0%, ${color}cc 100%)` }
    : undefined;

  return (
    <Link
      href={`${basePath}/${id}`}
      className={`group relative overflow-hidden rounded-[16px] p-5 shadow-sm transition-shadow active:shadow-none ${
        color ? "" : "bg-gradient-to-br from-blue-500 to-indigo-600"
      }`}
      style={bgStyle}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative z-10">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
          {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — {end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </span>
        <h3 className="mt-3 text-[18px] font-bold text-white">
          {name || destination}
        </h3>
        <p className="mt-1 text-[13px] text-white/80">
          {name ? `${destination} · ` : ""}
          {days} jour{days > 1 ? "s" : ""}
          {transport && ` · ${transport}`}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="default" className="bg-white/20 text-white border-transparent">
              {fmt(parseFloat(priceAdult))}/pers.
            </Badge>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
              {maxSeats ? ` / ${maxSeats}` : ""}
            </span>
            {isFull && (
              <span className="rounded-full bg-red-500/80 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Complet
              </span>
            )}
          </div>
          <span className="rounded-[8px] bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-800 shadow-sm transition-transform group-active:scale-95">
            Voir &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
