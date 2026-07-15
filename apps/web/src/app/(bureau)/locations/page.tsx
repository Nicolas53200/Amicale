import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { AssetCard } from "@/components/assets/asset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAssets } from "@/lib/actions/assets";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export default async function LocationsPage() {
  const assets = await getAssets();
  const total = assets.length;
  const totalBookings = assets.reduce(
    (s, a) =>
      s + ((a.asset_bookings as { count: number }[])?.[0]?.count ?? 0),
    0
  );
  const avgRate =
    total > 0
      ? assets.reduce((s, a) => s + parseFloat(String(a.daily_rate ?? 0)), 0) / total
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Locations</h1>
          <p className="text-sm text-content-secondary">
            Gérez les biens locatifs de votre amicale
          </p>
        </div>
        <Button asChild>
          <Link href="/bureau/locations/new">Nouveau bien</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Biens" value={String(total)} icon="🏠" />
        <StatCard label="Réservations" value={String(totalBookings)} icon="📋" />
        <StatCard label="Tarif moyen" value={fmt(avgRate)} icon="💰" />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="Aucun bien"
          description="Ajoutez votre premier bien locatif pour commencer"
          action={{ label: "Ajouter un bien", href: "/bureau/locations/new" }}
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
              basePath="/bureau/locations"
            />
          ))}
        </div>
      )}
    </div>
  );
}
