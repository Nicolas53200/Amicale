import Link from "next/link";

interface TripCardProps {
  id: string;
  name?: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  priceAdult: string;
  maxSeats?: number | null;
  registrationCount: number;
  color?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  transport?: string | null;
  accommodation?: string | null;
  childrenAllowed?: boolean;
  basePath?: string;
  variant?: "amicaliste" | "bureau";
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function TripCard({
  id,
  name,
  destination,
  startDate,
  endDate,
  priceAdult,
  maxSeats,
  registrationCount,
  color,
  imageUrl,
  icon,
  transport,
  accommodation,
  childrenAllowed,
  basePath = "/amicaliste/voyages",
  variant = "amicaliste",
}: TripCardProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const capacity = maxSeats || 1;
  const pct = Math.min(100, Math.round((registrationCount / capacity) * 100));
  const remaining = maxSeats ? maxSeats - registrationCount : null;
  const isFull = remaining !== null && remaining <= 0;

  const bgColor = color || "#8B5CF6";
  const dateStr = `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
  const durationStr = `${days} jour${days > 1 ? "s" : ""}`;

  const heroStyle: React.CSSProperties = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: bgColor };

  const statusLabel = isFull
    ? "Complet"
    : remaining !== null && remaining <= 10
      ? `Plus que ${remaining} place${remaining > 1 ? "s" : ""} !`
      : "Inscriptions ouvertes";
  const statusBg = isFull
    ? "bg-red-100/80 text-red-600 dark:bg-red-500/20 dark:text-red-400"
    : remaining !== null && remaining <= 10
      ? "bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
      : "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";

  const jaugeColor =
    pct >= 60 ? "#8B5CF6" : pct >= 30 ? "#F59E0B" : "#E8553A";

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group block overflow-hidden rounded-[20px] border border-[rgba(0,0,0,.06)] bg-surface-elevated shadow-sm transition-shadow active:scale-[0.99] dark:border-white/5"
    >
      {/* Visual header */}
      <div className="relative flex h-[175px] flex-col justify-end p-4" style={heroStyle}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/[.68] to-black/5" />
        {!imageUrl && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] text-white/[.16]"
          >
            {icon === "ti-mountain" ? (
              <>
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </>
            ) : (
              <>
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </>
            )}
          </svg>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBg}`}>
          {statusLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-[10px] bg-black/40 px-2.5 py-1 text-[13px] font-bold text-white">
          {fmt(parseFloat(priceAdult))}
        </span>
        <div className="relative z-[1]">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.8px] text-white/[.78]">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {destination}
          </div>
          <div className="mt-1 text-[16px] font-bold leading-tight text-white">
            {name || destination}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {dateStr} &middot; {durationStr}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        {/* Inscription jauge */}
        <div className="mb-2.5">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="text-[12px] font-semibold text-content-primary">Inscriptions</span>
            <span className="text-[12px] text-content-secondary">
              <strong>{registrationCount}</strong> / {capacity} places
              {remaining !== null && remaining > 0 && (
                <span style={{ color: remaining <= 10 ? "#E8553A" : "#1E7A4A", fontWeight: remaining <= 10 ? 700 : 600 }}>
                  {" "}&middot; {remaining} restante{remaining > 1 ? "s" : ""}{remaining <= 10 ? " !" : ""}
                </span>
              )}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-[5px] bg-surface-secondary">
            <div
              className="h-full rounded-[5px] transition-all duration-500"
              style={{ width: `${pct}%`, background: jaugeColor }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded-[8px] bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-content-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
            {transport || "—"}
          </span>
          <span className="flex items-center gap-1 rounded-[8px] bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-content-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
            {accommodation || "—"}
          </span>
          {childrenAllowed && (
            <span className="flex items-center gap-1 rounded-[8px] bg-red-50 px-2 py-0.5 text-[10px] font-medium text-[#E8553A] dark:bg-red-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Enfants accept&eacute;s
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2">
          {variant === "amicaliste" ? (
            <>
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-[13px] font-semibold text-white" style={{ background: "#8B5CF6" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                Voir la fiche
              </div>
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3 py-2.5 text-[13px] font-semibold text-white" style={{ background: "#1E7A4A" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                S&apos;inscrire
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-between rounded-[12px] bg-surface-secondary px-3 py-2.5">
              <span className="text-[12px] text-content-muted">
                {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
                {maxSeats != null && ` / ${maxSeats}`}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}
          <div className="flex items-center gap-1 rounded-[12px] bg-purple-50 px-3 py-2.5 text-[13px] font-semibold text-[#8B5CF6] dark:bg-purple-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {registrationCount}
          </div>
        </div>
      </div>
    </Link>
  );
}
