import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommissionCardProps {
  id: string;
  name: string;
  model: string;
  icon?: string | null;
  color?: string | null;
  budget: string;
  memberCount: number;
  isFixed: boolean;
  basePath?: string;
}

const modelLabels: Record<string, string> = {
  simple: "Simple",
  evenement: "Événements",
  location: "Locations",
  voyage: "Voyages",
  bons: "Bons cadeaux",
};

export function CommissionCard({
  id,
  name,
  model,
  icon,
  color,
  budget,
  memberCount,
  isFixed,
  basePath = "/bureau/commissions",
}: CommissionCardProps) {
  const budgetNum = parseFloat(budget || "0");

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:scale-[0.98]"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-lg",
          color ? "" : "bg-brand-100 dark:bg-brand-500/20"
        )}
        style={color ? { backgroundColor: `${color}20`, color } : undefined}
      >
        {icon || "📋"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[14px] font-semibold text-content-primary">
            {name}
          </h3>
          {isFixed && <Badge variant="neutral">Fixe</Badge>}
        </div>
        <p className="mt-0.5 text-[12px] text-content-muted">
          {modelLabels[model] || model} · {memberCount} membre
          {memberCount !== 1 ? "s" : ""}
        </p>
        {budgetNum > 0 && (
          <p className="mt-1 text-[13px] font-medium tabular-nums text-content-secondary">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(budgetNum)}
          </p>
        )}
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
        className="mt-2 shrink-0 text-content-muted"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}
