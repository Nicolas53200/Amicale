import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsset } from "@/lib/actions/assets";
import { GradientHeader } from "@/components/layout/gradient-header";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AssetActions } from "@/components/assets/asset-actions";
import { BookingCalendar } from "@/components/assets/booking-calendar";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const typeLabels: Record<string, string> = {
  appartement: "Appartement",
  barnum: "Barnum",
  remorque: "Remorque",
  camping: "Camping-car",
};

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let asset;
  try {
    asset = await getAsset(id);
  } catch {
    notFound();
  }

  const bookings = asset.asset_bookings ?? [];
  const pending = bookings.filter((b: { status: string }) => b.status === "en_attente");
  const confirmed = bookings.filter((b: { status: string }) => b.status === "validee");

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={asset.name}
        subtitle={typeLabels[asset.type] || asset.type}
        backHref="/bureau/locations"
      />

      {/* Info card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{fmt(asset.daily_rate)}/jour</Badge>
          {asset.deposit > 0 && (
            <Badge variant="neutral">Caution : {fmt(asset.deposit)}</Badge>
          )}
        </div>
        {asset.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {asset.description}
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <Link
            href={`/bureau/locations/${id}/edit`}
            className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
          >
            Modifier
          </Link>
          <AssetActions assetId={id} />
        </div>
      </div>

      {/* Règlement */}
      {asset.rules && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Règlement intérieur
          </h3>
          <p className="whitespace-pre-wrap text-[13px] text-content-secondary">
            {asset.rules}
          </p>
        </div>
      )}

      {/* Calendrier */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Calendrier
        </h3>
        <BookingCalendar assetId={asset.id} />
      </div>

      {/* En attente */}
      {pending.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            En attente ({pending.length})
          </h3>
          <div className="flex flex-col gap-2">
            {pending.map((b: { id: string; start_date: string; end_date: string; total_amount: number; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
              <div key={b.id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                <Avatar
                  name={`${b.members.first_name} ${b.members.last_name}`}
                  src={b.members.avatar_url}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-content-primary">
                    {b.members.first_name} {b.members.last_name}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {new Date(b.start_date).toLocaleDateString("fr-FR")} → {new Date(b.end_date).toLocaleDateString("fr-FR")}
                    {" · "}
                    {fmt(b.total_amount)}
                  </p>
                </div>
                <Badge variant="warning">En attente</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmées */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Réservations confirmées ({confirmed.length})
        </h3>
        {confirmed.length === 0 ? (
          <p className="py-2 text-center text-[13px] text-content-muted">Aucune réservation confirmée</p>
        ) : (
          <div className="flex flex-col gap-2">
            {confirmed.map((b: { id: string; start_date: string; end_date: string; total_amount: number; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
              <div key={b.id} className="flex items-center gap-3 rounded-[10px] bg-surface-secondary p-2.5">
                <Avatar
                  name={`${b.members.first_name} ${b.members.last_name}`}
                  src={b.members.avatar_url}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-content-primary">
                    {b.members.first_name} {b.members.last_name}
                  </p>
                  <p className="text-[11px] text-content-muted">
                    {new Date(b.start_date).toLocaleDateString("fr-FR")} → {new Date(b.end_date).toLocaleDateString("fr-FR")}
                    {" · "}
                    {fmt(b.total_amount)}
                  </p>
                </div>
                <Badge variant="success">Confirmée</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
