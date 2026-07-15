import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccueilPage() {
  const supabase = await createClient();

  const [eventsRes, commissionsRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, date, location, image_url")
      .gte("date", new Date().toISOString())
      .order("date")
      .limit(3),
    supabase
      .from("commissions")
      .select("*, commission_members(count)")
      .eq("active", true)
      .order("name")
      .limit(4),
  ]);

  const events = eventsRes.data ?? [];
  const commissions = commissionsRes.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Bienvenue</h1>
        <p className="text-sm text-content-secondary">
          Retrouvez ici les dernières actualités de votre amicale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochains événements</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              title="Aucun événement à venir"
              description="Les prochains événements apparaîtront ici"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-lg dark:bg-brand-500/20">
                    🎉
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">
                      {ev.title}
                    </p>
                    <p className="text-xs text-content-muted">
                      {new Date(ev.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                      {ev.location && ` · ${ev.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {commissions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-content-primary">
            Commissions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {commissions.map((c) => (
              <CommissionCard
                key={c.id}
                id={c.id}
                name={c.name}
                model={c.model}
                icon={c.icon}
                color={c.color}
                budget={c.budget}
                memberCount={
                  Array.isArray(c.commission_members)
                    ? c.commission_members.length
                    : (c.commission_members as { count: number }[])?.[0]?.count ?? 0
                }
                isFixed={c.is_fixed}
                basePath="/amicaliste/commissions"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
