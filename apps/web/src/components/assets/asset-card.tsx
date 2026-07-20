import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AssetCardProps {
  id: string;
  name: string;
  type: string;
  dailyRate: string;
  deposit: string;
  bookingCount: number;
  status?: string | null;
  capacity?: number | null;
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

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  disponible: { label: "Disponible", variant: "success" },
  reserve: { label: "Reserve", variant: "warning" },
  maintenance: { label: "Maintenance", variant: "danger" },
  indisponible: { label: "Indisponible", variant: "neutral" },
};

export function AssetCard({
  id,
  name,
  type,
  dailyRate,
  deposit,
  bookingCount,
  status,
  capacity,
  basePath = "/amicaliste/locations",
}: AssetCardProps) {
  const statusInfo = statusLabels[status ?? "disponible"] ?? { label: "Disponible", variant: "success" as const };

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:scale-[0.98]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-brand-100 text-xl dark:bg-brand-500/20">
        {typeIcons[type] || "📦"}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[14px] font-semibold text-content-primary">
          {name}
        </h3>
        <p className="mt-0.5 text-[12px] text-content-muted">
          {typeLabels[type] || type}
          {capacity ? ` · ${capacity} pers.` : ""}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="default">{fmt(parseFloat(dailyRate))}/jour</Badge>
          {parseFloat(deposit) > 0 && (
            <span className="text-[11px] text-content-muted">
              Caution : {fmt(parseFloat(deposit))}
            </span>
          )}
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
