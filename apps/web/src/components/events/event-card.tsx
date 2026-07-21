import Link from "next/link";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  color?: string | null;
  published?: boolean;
  basePath?: string;
  variant?: "amicaliste" | "bureau";
  registrationCount?: number;
  maxAttendees?: number | null;
  price?: string;
}

export function EventCard({
  id,
  title,
  date,
  location,
  description,
  imageUrl,
  icon,
  color,
  published = true,
  basePath = "/amicaliste/evenements",
  variant = "amicaliste",
  registrationCount = 0,
  maxAttendees,
  price,
}: EventCardProps) {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(":", "h");

  const bgColor = color || "#E8553A";

  const heroStyle: React.CSSProperties = imageUrl
    ? {
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,.6) 0%, rgba(0,0,0,.05) 60%), url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: bgColor };

  return (
    <Link
      href={`${basePath}/${id}`}
      className="group block overflow-hidden rounded-[16px] bg-surface-elevated shadow-sm transition-shadow active:scale-[0.98]"
    >
      {/* Hero */}
      <div className="relative flex h-[120px] items-end p-3.5" style={heroStyle}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/5" />
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
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] text-white/15"
          >
            {icon === "ti-trophy" ? (
              <>
                <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
                <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" />
                <path d="M9 21h6" />
                <path d="M12 16v5" />
              </>
            ) : icon === "ti-music" ? (
              <>
                <circle cx="8" cy="18" r="4" />
                <path d="M12 18V2l7 4" />
              </>
            ) : icon === "ti-ball-football" ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="m12 2 3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
              </>
            ) : (
              <>
                <path d="M5.8 11.3 2 22l10.7-3.79" />
                <path d="M4 3h.01" />
                <path d="M22 8h.01" />
                <path d="M15 2h.01" />
                <path d="M22 20h.01" />
                <path d="M22 2 12 12" />
                <path d="m2 2 10 10" />
                <path d="m6.5 15.5 5 5" />
              </>
            )}
          </svg>
        )}
        <div className="relative z-[1]">
          <div className="text-[16px] font-bold leading-tight text-white">
            {title}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[12px] text-white/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {dateStr}
              {timeStr !== "00h00" && ` · ${timeStr}`}
              {location && ` · ${location}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {description && (
          <p className="mb-3 line-clamp-2 text-[12px] leading-[1.5] text-content-secondary">
            {description}
          </p>
        )}
        {!published && (
          <span className="mb-2 inline-block rounded-full bg-surface-secondary px-2.5 py-0.5 text-[10px] font-semibold text-content-secondary">
            Brouillon
          </span>
        )}
        {variant === "bureau" ? (
          <div className="flex items-center justify-between rounded-[10px] bg-surface-secondary px-3 py-2.5">
            <span className="text-[12px] text-content-muted">
              {registrationCount} inscrit{registrationCount !== 1 ? "s" : ""}
              {maxAttendees != null && ` / ${maxAttendees}`}
            </span>
            <div className="flex items-center gap-2">
              {price && parseFloat(price) > 0 && (
                <span className="text-[12px] font-semibold text-content-primary">{fmt(parseFloat(price))}</span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-content-muted"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: bgColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            S&apos;inscrire
          </div>
        )}
      </div>
    </Link>
  );
}
