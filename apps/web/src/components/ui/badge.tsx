import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
        neutral: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
