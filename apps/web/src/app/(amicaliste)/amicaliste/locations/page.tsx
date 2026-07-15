import { AssetCard } from "@/components/assets/asset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAssets } from "@/lib/actions/assets";

export default async function LocationsPage() {
  const assets = await getAssets();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Locations</h1>
        <p className="text-sm text-content-secondary">
          Les biens disponibles à la location
        </p>
      </div>

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
