"use client";

interface SportEvent {
  nom: string;
  date: string;
  lieu: string;
  statut: "programme" | "termine";
  description: string;
}

const DEMO_EVENTS: SportEvent[] = [
  {
    nom: "Tournoi sportif inter-centres",
    date: "2026-07-12T10:00",
    lieu: "Stade municipal",
    statut: "programme",
    description: "Venez participer au tournoi inter-centres ! Football, volleyball et course de relais au programme.",
  },
  {
    nom: "Tournoi de football",
    date: "2026-09-20T14:00",
    lieu: "Terrain synthétique",
    statut: "programme",
    description: "Tournoi de football amical entre casernes. Équipes de 5 joueurs.",
  },
];

const STATUT_BADGE: Record<string, { label: string; cls: string }> = {
  programme: { label: "À venir", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30" },
  termine: { label: "Terminé", cls: "bg-green-100 text-green-700 dark:bg-green-900/30" },
};

export function SportAmicaliste() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-green-600 to-emerald-700 p-5">
        <div className="pointer-events-none absolute -right-4 -top-4 text-[80px] opacity-[0.12]">🏆</div>
        <div className="relative z-10">
          <h2 className="text-[20px] font-extrabold text-white">Commission Sportive</h2>
          <p className="mt-1 text-[13px] text-white/80">Activités sportives 2026</p>
          <div className="mt-3 flex gap-3">
            <div className="rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[16px] font-bold text-white">{DEMO_EVENTS.filter((e) => e.statut === "programme").length}</p>
              <p className="text-[10px] text-white/70">À venir</p>
            </div>
            <div className="rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[16px] font-bold text-white">{DEMO_EVENTS.length}</p>
              <p className="text-[10px] text-white/70">Total</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Prochains événements</p>
      {DEMO_EVENTS.filter((e) => e.statut === "programme").map((ev, i) => {
        const d = new Date(ev.date);
        const badge = STATUT_BADGE[ev.statut];
        return (
          <div key={i} className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-green-100 dark:bg-green-900/30">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-content-primary">{ev.nom}</p>
                  <p className="text-[11px] text-content-muted">
                    {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    {" · "}{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[11px] text-content-muted">📍 {ev.lieu}</p>
                </div>
              </div>
              {badge && (
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-content-secondary">{ev.description}</p>
          </div>
        );
      })}

      <div className="rounded-[14px] bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex items-start gap-3">
          <span className="text-green-600">💬</span>
          <div>
            <p className="text-[13px] font-semibold text-green-800 dark:text-green-300">Mot de la commission</p>
            <p className="mt-1 text-[12px] leading-relaxed text-green-700 dark:text-green-400">
              La commission sportive organise des événements tout au long de l&apos;année pour favoriser la cohésion et le bien-être. N&apos;hésitez pas à proposer de nouvelles activités !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
