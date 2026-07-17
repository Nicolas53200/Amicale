"use client";

const CAMPAGNE = {
  annee: 2026,
  prixUnitaire: 8,
  objectif: 2000,
  vendus: 1247,
};

const POINTS_VENTE = [
  { nom: "Caserne Centre", adresse: "12 rue du Centre", horaires: "8h-18h", icon: "🚒" },
  { nom: "Caserne Nord", adresse: "45 avenue du Nord", horaires: "8h-17h", icon: "🚒" },
  { nom: "Marché du samedi", adresse: "Place de la Mairie", horaires: "8h-13h (samedi)", icon: "🏪" },
  { nom: "Permanence amicale", adresse: "Salle Duval", horaires: "10h-12h (mercredi)", icon: "📋" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function CalendriersAmicaliste() {
  const pct = Math.round((CAMPAGNE.vendus / CAMPAGNE.objectif) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-indigo-600 to-indigo-700 p-5">
        <div className="pointer-events-none absolute -right-4 -top-4 text-[80px] opacity-[0.12]">📅</div>
        <div className="relative z-10">
          <h2 className="text-[20px] font-extrabold text-white">Calendriers {CAMPAGNE.annee}</h2>
          <p className="mt-1 text-[13px] text-white/80">Campagne de vente en cours</p>
          <div className="mt-3 flex gap-3">
            <div className="rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[16px] font-bold text-white">{fmt(CAMPAGNE.prixUnitaire)}</p>
              <p className="text-[10px] text-white/70">Prix unitaire</p>
            </div>
            <div className="rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[16px] font-bold text-white">{CAMPAGNE.vendus}</p>
              <p className="text-[10px] text-white/70">Vendus</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">Avancement de la campagne</p>
        <div className="flex items-end justify-between">
          <p className="text-[24px] font-bold text-indigo-600 dark:text-indigo-400">{pct}%</p>
          <p className="text-[12px] text-content-muted">{CAMPAGNE.vendus} / {CAMPAGNE.objectif} objectif</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Points de vente</p>
        {POINTS_VENTE.map((pv, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-surface-secondary py-3 last:border-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-indigo-100 dark:bg-indigo-900/30">
              <span className="text-lg">{pv.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-content-primary">{pv.nom}</p>
              <p className="text-[11px] text-content-muted">{pv.adresse}</p>
            </div>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">{pv.horaires}</span>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] bg-indigo-50 p-4 dark:bg-indigo-900/20">
        <div className="flex items-start gap-3">
          <span className="text-indigo-600">ℹ️</span>
          <div>
            <p className="text-[13px] font-semibold text-indigo-800 dark:text-indigo-300">Comment participer ?</p>
            <p className="mt-1 text-[12px] leading-relaxed text-indigo-700 dark:text-indigo-400">
              Vous pouvez acheter vos calendriers auprès des points de vente ci-dessus ou directement auprès des membres de la commission. Les bénéfices financent les activités de l&apos;amicale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
