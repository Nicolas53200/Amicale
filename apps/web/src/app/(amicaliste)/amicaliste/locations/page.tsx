import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getAssets } from "@/lib/actions/assets";

const typeIcons: Record<string, string> = {
  appartement: "🏠",
  barnum: "⛺",
  remorque: "🚛",
  camping: "🏕️",
};

const typeColors: Record<string, string> = {
  appartement: "from-blue-500 to-blue-600",
  barnum: "from-emerald-500 to-emerald-600",
  remorque: "from-amber-500 to-amber-600",
  camping: "from-teal-500 to-teal-600",
};

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default async function LocationsPage() {
  const assets = await getAssets();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Locations"
        subtitle="Les biens disponibles a la location"
      />

      {/* Type legend */}
      {assets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {Object.entries(typeLabels).map(([type, label]) => {
            const count = assets.filter((a) => a.type === type).length;
            if (count === 0) return null;
            return (
              <div
                key={type}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5 text-[12px] font-medium text-content-secondary shadow-sm"
              >
                <span>{typeIcons[type]}</span>
                {label}
                <span className="rounded-full bg-surface-secondary px-1.5 text-[10px] font-bold text-content-muted">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {assets.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Aucun bien disponible"
          description="Les biens locatifs de votre amicale apparaitront ici"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((a) => {
            const gradient = typeColors[a.type] || "from-brand-500 to-brand-600";
            return (
              <Link
                key={a.id}
                href={`/amicaliste/locations/${a.id}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] bg-gradient-to-br ${gradient} p-4 shadow-sm transition-shadow active:shadow-none`}
                style={{ minHeight: "140px" }}
              >
                <div>
                  <span className="text-2xl">{typeIcons[a.type] || "📦"}</span>
                  <h3 className="mt-2 text-[14px] font-bold text-white">
                    {a.name}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {typeLabels[a.type] || a.type}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                    {fmt(parseFloat(String(a.daily_rate)))}/jour
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
