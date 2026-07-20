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
  icon?: string | null;
  color?: string | null;
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
  color,
}: EventCardProps) {
  const d = new Date(date);
  const priceNum = parseFloat(price || "0");
  const isFull = maxAttendees ? registrationCount >= maxAttendees : false;

  const dateBoxStyle = color
    ? { backgroundColor: `${color}18`, color }
    : undefined;

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:scale-[0.98]"
    >
      <div
        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[12px] ${color ? "" : "bg-brand-100 dark:bg-brand-500/20"}`}
        style={dateBoxStyle}
      >
        <span
          className={`text-[10px] font-bold uppercase ${color ? "" : "text-brand-600 dark:text-brand-400"}`}
          style={color ? { color } : undefined}
        >
          {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
        </span>
        <span
          className={`text-[18px] font-bold leading-none ${color ? "" : "text-brand-700 dark:text-brand-300"}`}
          style={color ? { color } : undefined}
        >
          {d.getDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold text-content-primary">
          {title}
        </h3>
        <p className="mt-0.5 text-[12px] text-content-muted">
          {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")}
          {location && ` · ${location}`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {priceNum > 0 ? (
            <Badge variant="default">{fmt(priceNum)}</Badge>
          ) : (
            <Badge variant="success">Gratuit</Badge>
          )}
          <span className="text-[11px] text-content-muted">
            {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
            {maxAttendees && ` / ${maxAttendees}`}
          </span>
          {isFull && <Badge variant="danger">Complet</Badge>}
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-3 shrink-0 text-content-muted"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
