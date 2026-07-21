import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getAssets } from "@/lib/actions/assets";

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

const typeColors: Record<string, string> = {
  appartement: "#3478F6",
  barnum: "#1E7A4A",
  remorque: "#F59E0B",
  camping: "#0F6E56",
};

const typeIconPaths: Record<string, React.ReactNode> = {
  appartement: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  barnum: <><path d="M18 8c0-3.3-2.7-6-6-6S6 4.7 6 8"/><path d="m3 8 3 12h12l3-12"/><path d="M12 8v12"/></>,
  remorque: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  camping: <><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></>,
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  disponible: { label: "Disponible", bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  reserve: { label: "Réservé", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  maintenance: { label: "Maintenance", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400" },
  indisponible: { label: "Indisponible", bg: "bg-gray-100 dark:bg-gray-500/20", text: "text-gray-600 dark:text-gray-400" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default async function LocationsPage() {
  const assets = await getAssets();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Locations"
        subtitle="Les biens disponibles à la location"
      />

      {assets.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Aucun bien disponible"
          description="Les biens locatifs de votre amicale apparaîtront ici"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((a) => {
            const photos = (a.photos as string[]) || [];
            const coverIdx = (a.cover_index as number | null) ?? 0;
            const coverPhoto = photos.length > 0 ? photos[Math.min(coverIdx, photos.length - 1)] : null;
            const assetColor = (a.color as string) || typeColors[a.type] || "#8B5CF6";
            const status = statusConfig[(a.status as string) || "disponible"] || statusConfig.disponible;

            return (
              <Link
                key={a.id}
                href={`/amicaliste/locations/${a.id}`}
                className="group overflow-hidden rounded-[20px] border border-[rgba(0,0,0,.06)] bg-surface-elevated shadow-sm transition-all active:scale-[0.98] dark:border-white/5"
              >
                {/* Photo area */}
                <div
                  className="relative flex h-[85px] items-center justify-center"
                  style={
                    coverPhoto
                      ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: `${assetColor}15` }
                  }
                >
                  {!coverPhoto && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="38"
                      height="38"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: assetColor, opacity: 0.28 }}
                    >
                      {typeIconPaths[a.type] || typeIconPaths.appartement}
                    </svg>
                  )}
                  <span className={`absolute right-1.5 top-1.5 rounded-[8px] px-1.5 py-0.5 text-[9px] font-semibold ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                {/* Body */}
                <div className="px-2.5 py-2">
                  <div className="truncate text-[12px] font-semibold text-content-primary">
                    {a.name}
                  </div>
                  <div className="mt-0.5 text-[10px] text-content-secondary">
                    {fmt(a.daily_rate)}/jour
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
