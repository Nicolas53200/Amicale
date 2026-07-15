import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsset } from "@/lib/actions/assets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
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
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            {asset.name}
          </h1>
          <p className="mt-1 text-sm text-content-muted capitalize">
            {typeLabels[asset.type] || asset.type}
          </p>
          <div className="mt-2 flex gap-2">
            <Badge variant="default">{fmt(asset.daily_rate)}/jour</Badge>
            {asset.deposit > 0 && (
              <Badge variant="neutral">Caution : {fmt(asset.deposit)}</Badge>
            )}
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/bureau/locations">Retour</Link>
        </Button>
      </div>

      {asset.description && (
        <p className="text-sm text-content-secondary">{asset.description}</p>
      )}

      {asset.rules && (
        <Card>
          <CardHeader>
            <CardTitle>Règlement intérieur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-content-secondary">
              {asset.rules}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <BookingCalendar assetId={asset.id} />

        <div className="flex flex-col gap-4">
          {pending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>En attente ({pending.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {pending.map((b: { id: string; start_date: string; end_date: string; total_amount: number; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <Avatar
                        name={`${b.members.first_name} ${b.members.last_name}`}
                        src={b.members.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-content-primary">
                          {b.members.first_name} {b.members.last_name}
                        </p>
                        <p className="text-xs text-content-muted">
                          {new Date(b.start_date).toLocaleDateString("fr-FR")} →{" "}
                          {new Date(b.end_date).toLocaleDateString("fr-FR")}
                          {" · "}
                          {fmt(b.total_amount)}
                        </p>
                      </div>
                      <Badge variant="warning">En attente</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Réservations confirmées ({confirmed.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {confirmed.length === 0 ? (
                <p className="text-sm text-content-muted">Aucune réservation confirmée</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {confirmed.map((b: { id: string; start_date: string; end_date: string; total_amount: number; members: { first_name: string; last_name: string; avatar_url: string | null } }) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <Avatar
                        name={`${b.members.first_name} ${b.members.last_name}`}
                        src={b.members.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-content-primary">
                          {b.members.first_name} {b.members.last_name}
                        </p>
                        <p className="text-xs text-content-muted">
                          {new Date(b.start_date).toLocaleDateString("fr-FR")} →{" "}
                          {new Date(b.end_date).toLocaleDateString("fr-FR")}
                          {" · "}
                          {fmt(b.total_amount)}
                        </p>
                      </div>
                      <Badge variant="success">Confirmée</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
