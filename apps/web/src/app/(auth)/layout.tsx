export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Gradient header with decorative shapes */}
      <div className="relative bg-accent-gradient pb-20 pt-12 text-center pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -right-8 top-16 h-36 w-36 rounded-full bg-white/[0.06]" />
          <div className="absolute bottom-4 left-1/4 h-24 w-24 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-6 right-1/3 h-16 w-16 rounded-full bg-white/[0.04]" />
        </div>
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[20px] bg-white shadow-lg">
            <span className="text-4xl">🔥</span>
          </div>
          <h1 className="text-[26px] font-bold text-white">Bienvenue !</h1>
          <p className="mt-1 text-[14px] text-white/75">
            Amicale des Sapeurs-Pompiers
          </p>
        </div>
        {/* Wave separator */}
        <svg
          className="absolute bottom-0 left-0 right-0 -mb-px block w-full"
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
      {/* Content */}
      <div className="-mt-8 px-4 pb-8">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
