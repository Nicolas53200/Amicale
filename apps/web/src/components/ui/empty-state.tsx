import { cn } from "@/lib/utils";
import { Button } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      {icon && <span className="mb-3 text-4xl">{icon}</span>}
      <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p>
      )}
      {action && (
        <Button className="mt-4" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
