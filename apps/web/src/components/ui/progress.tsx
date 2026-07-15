import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    pct < 70
      ? "bg-emerald-500"
      : pct < 90
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-secondary", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-300", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
