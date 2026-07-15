import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface-elevated p-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-content-secondary">
          {label}
        </p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.positive ? "text-emerald-600" : "text-red-600"
          )}
        >
          {trend.positive ? "+" : ""}
          {trend.value}
        </p>
      )}
    </div>
  );
}
