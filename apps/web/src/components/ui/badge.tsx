import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-semibold",
  {
    variants: {
      variant: {
        default: "bg-[#FFF4EE] text-[#FF6B35] dark:bg-brand-500/20 dark:text-brand-400",
        success: "bg-[#E8F5EE] text-[#1E7A4A] dark:bg-emerald-500/20 dark:text-emerald-400",
        warning: "bg-[#FFF8E1] text-[#F59E0B] dark:bg-amber-500/20 dark:text-amber-400",
        danger: "bg-[#FFD9D2] text-[#C43E26] dark:bg-red-500/20 dark:text-red-400",
        neutral: "bg-[#F2F2F7] text-[#636366] dark:bg-gray-500/20 dark:text-gray-400",
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
