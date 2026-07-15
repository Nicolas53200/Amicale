import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AccueilPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Bienvenue
        </h1>
        <p className="text-sm text-content-secondary">
          Retrouvez ici les dernières actualités de votre amicale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochains événements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-muted">
            Aucun événement à venir pour le moment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voyages disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-muted">
            Aucun voyage disponible pour le moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
