import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  price?: string;
  maxAttendees?: number | null;
  registrationCount: number;
  basePath?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function EventCard({
  id,
  title,
  date,
  location,
  price,
  maxAttendees,
  registrationCount,
  basePath = "/amicaliste/evenements",
}: EventCardProps) {
  const d = new Date(date);
  const priceNum = parseFloat(price || "0");
  const isFull = maxAttendees ? registrationCount >= maxAttendees : false;

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex gap-4 rounded-lg bg-surface-elevated p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[14px] bg-brand-100 dark:bg-brand-500/20">
        <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">
          {d.toLocaleDateString("fr-FR", { month: "short" })}
        </span>
        <span className="text-lg font-bold leading-none text-brand-700 dark:text-brand-300">
          {d.getDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-content-primary group-hover:text-brand-500">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-content-muted">
          {d.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {location && ` · ${location}`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {priceNum > 0 && (
            <Badge variant="default">{fmt(priceNum)}</Badge>
          )}
          {priceNum === 0 && <Badge variant="success">Gratuit</Badge>}
          <span className="text-xs text-content-muted">
            {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
            {maxAttendees && ` / ${maxAttendees}`}
          </span>
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>
    </Link>
  );
}
