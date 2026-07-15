import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AssetCardProps {
  id: string;
  name: string;
  type: string;
  dailyRate: string;
  deposit: string;
  bookingCount: number;
  basePath?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const typeIcons: Record<string, string> = {
  appartement: "🏠",
  barnum: "⛺",
  remorque: "🚛",
  camping: "🏕️",
};

export function AssetCard({
  id,
  name,
  type,
  dailyRate,
  deposit,
  bookingCount,
  basePath = "/amicaliste/locations",
}: AssetCardProps) {
  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex gap-4 rounded-xl border border-border bg-surface-elevated p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xl dark:bg-brand-500/20">
        {typeIcons[type] || "📦"}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-content-primary group-hover:text-brand-500">
          {name}
        </h3>
        <p className="mt-0.5 text-xs capitalize text-content-muted">{type}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="default">{fmt(parseFloat(dailyRate))}/jour</Badge>
          {parseFloat(deposit) > 0 && (
            <span className="text-xs text-content-muted">
              Caution : {fmt(parseFloat(deposit))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
