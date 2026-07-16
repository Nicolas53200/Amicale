import Link from "next/link";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getAssets } from "@/lib/actions/assets";
import { LocationTabs } from "@/components/assets/location-tabs";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const typeIcons: Record<string, string> = {
  appartement: "🏠",
  barnum: "⛺",
  remorque: "🚛",
  camping: "🏕️",
};

const typeColors: Record<string, { bg: string; text: string }> = {
  appartement: { bg: "bg-blue-500", text: "text-white" },
  barnum: { bg: "bg-emerald-500", text: "text-white" },
  remorque: { bg: "bg-amber-500", text: "text-white" },
  camping: { bg: "bg-teal-500", text: "text-white" },
};

export default async function LocationsPage() {
  const assets = await getAssets();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Commission Locations"
        subtitle="Gestion des biens"
        backHref="/bureau/dashboard"
      />

      <LocationTabs />

      {assets.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Aucun bien"
          description="Ajoutez votre premier bien locatif pour commencer"
          action={{ label: "Ajouter un bien", href: "/bureau/locations/new" }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {assets.map((a) => {
            const colors = typeColors[a.type] || { bg: "bg-brand-500", text: "text-white" };
            return (
              <Link
                key={a.id}
                href={`/bureau/locations/${a.id}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[16px] ${colors.bg} p-4 shadow-sm transition-shadow active:shadow-none`}
                style={{ minHeight: "140px" }}
              >
                <div>
                  <span className="text-2xl">{typeIcons[a.type] || "📦"}</span>
                  <h3 className={`mt-2 text-[14px] font-bold ${colors.text}`}>
                    {a.name}
                  </h3>
                  <p className={`text-[11px] ${colors.text} opacity-80`}>
                    {fmt(parseFloat(String(a.daily_rate ?? 0)))}/jour
                  </p>
                </div>
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    Disponible
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Add new asset card */}
          <Link
            href="/bureau/locations/new"
            className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-border bg-surface-elevated p-4 text-content-muted transition-colors hover:border-brand-300 hover:text-brand-500"
            style={{ minHeight: "140px" }}
          >
            <span className="mb-1 text-2xl">+</span>
            <span className="text-[12px] font-semibold">Ajouter un bien</span>
          </Link>
        </div>
      )}
    </div>
  );
}
