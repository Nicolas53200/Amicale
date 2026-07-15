import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Tableau de bord
        </h1>
        <p className="text-sm text-content-secondary">
          Vue d&apos;ensemble de votre amicale
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm text-content-muted">Membres</p>
            <CardTitle className="text-3xl tabular-nums">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-content-muted">Commissions</p>
            <CardTitle className="text-3xl tabular-nums">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-content-muted">Budget total</p>
            <CardTitle className="text-3xl tabular-nums">-- &euro;</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <p className="text-sm text-content-muted">Événements à venir</p>
            <CardTitle className="text-3xl tabular-nums">--</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-muted">
            Les données seront disponibles une fois Supabase connecté.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
