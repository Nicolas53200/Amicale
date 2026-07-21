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
  active?: boolean;
  onToggleVisibility?: (id: string) => void;
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
  active = true,
  onToggleVisibility,
}: CommissionCardProps) {
  const budgetNum = parseFloat(budget || "0");

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-all",
        !active && "opacity-60"
      )}
    >
      <Link href={`${basePath}/${id}`} className="flex min-w-0 flex-1 items-start gap-3 active:scale-[0.98]">
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
            {!active && <Badge variant="danger">Masquée</Badge>}
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
      </Link>
      <div className="flex shrink-0 items-center gap-1 pt-1.5">
        {onToggleVisibility && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(id);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              active
                ? "text-[#1E7A4A] hover:bg-[#E8F5EE] dark:hover:bg-emerald-500/10"
                : "text-content-muted hover:bg-surface-secondary"
            )}
            title={active ? "Masquer côté amicaliste" : "Afficher côté amicaliste"}
          >
            {active ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        )}
        <Link href={`${basePath}/${id}`}>
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
            className="shrink-0 text-content-muted"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
