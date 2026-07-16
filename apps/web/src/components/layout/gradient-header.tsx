import Link from "next/link";

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
}

export function GradientHeader({
  title,
  subtitle,
  backHref,
  children,
}: GradientHeaderProps) {
  return (
    <div className="relative -mx-4 -mt-6 flex flex-col bg-accent-gradient pt-[env(safe-area-inset-top)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-4 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -right-12 top-32 h-32 w-32 rounded-full bg-white/[0.06]" />
      </div>

      <div className="relative z-10 px-4 pb-4 pt-4">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          )}
          <div>
            <h1 className="text-[22px] font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-[13px] text-white/70">{subtitle}</p>
            )}
          </div>
        </div>

        {children}
      </div>

      <svg
        className="relative z-10 -mb-px mt-auto block w-full"
        viewBox="0 0 1440 50"
        fill="none"
        preserveAspectRatio="none"
        style={{ height: "30px" }}
      >
        <path
          d="M0 50V25C200 5 400 0 720 15C1040 30 1240 10 1440 0V50H0Z"
          fill="var(--color-surface-secondary)"
        />
      </svg>
    </div>
  );
}
