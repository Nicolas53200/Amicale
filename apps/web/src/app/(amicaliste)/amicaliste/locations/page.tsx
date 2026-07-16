import { AssetCard } from "@/components/assets/asset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientHeader } from "@/components/layout/gradient-header";
import { getAssets } from "@/lib/actions/assets";

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
        <div className="flex flex-col gap-3">
          {assets.map((a) => (
            <AssetCard
              key={a.id}
              id={a.id}
              name={a.name}
              type={a.type}
              dailyRate={String(a.daily_rate)}
              deposit={String(a.deposit ?? 0)}
              bookingCount={
                (a.asset_bookings as { count: number }[])?.[0]?.count ?? 0
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
