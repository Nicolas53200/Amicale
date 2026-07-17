"use client";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const PRESTATAIRES = [
  { icon: "🌹", nom: "Fleuriste Dupont", adresse: "12 rue du Commerce" },
  { icon: "🧖", nom: "Spa Belle Vie", adresse: "Centre-ville, Laval" },
  { icon: "💍", nom: "Bijouterie Laval", adresse: "Place du Vieux-Saint-Louis" },
];

export function FdfAmicaliste() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-[16px] bg-pink-50 p-4 dark:bg-pink-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-pink-600">
            <span className="text-xl text-white">💝</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-pink-600">Fête des Femmes 2026</p>
            <p className="text-[12px] text-pink-800 dark:text-pink-400">8 mars 2026 · Commission dédiée</p>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-pink-800 dark:text-pink-400">
          Bon cadeau pour les femmes pompiers et les conjointes de pompiers.
        </p>
      </div>

      {/* Mon bon cadeau */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Mon bon cadeau</p>
        <div className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-2xl dark:bg-pink-900/30">🎁</div>
            <div>
              <p className="text-[14px] font-bold text-content-primary">Bon cadeau {fmt(50)}</p>
              <p className="text-[11px] text-content-muted">Valable chez nos prestataires partenaires</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30">
            À retirer
          </span>
        </div>
      </div>

      {/* Dates clés */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Dates clés</p>
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-secondary py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-pink-600">📅</span>
              <span className="text-[12px] text-content-secondary">Date de remise</span>
            </div>
            <span className="text-[12px] font-semibold text-content-primary">8 mars 2026</span>
          </div>
          <div className="flex items-center justify-between border-b border-surface-secondary py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">⏰</span>
              <span className="text-[12px] text-content-secondary">Limite d&apos;utilisation</span>
            </div>
            <span className="text-[12px] font-semibold text-amber-600">30 avr. 2026</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-pink-600">📍</span>
              <span className="text-[12px] text-content-secondary">Lieu de retrait</span>
            </div>
            <span className="text-[12px] text-content-primary">Local amicale</span>
          </div>
        </div>
      </div>

      {/* Prestataires */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Prestataires partenaires</p>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {PRESTATAIRES.map((p, i) => (
            <div key={i} className="flex min-w-[140px] shrink-0 flex-col items-center rounded-[14px] bg-pink-50 p-4 text-center dark:bg-pink-900/20">
              <span className="mb-2 text-3xl">{p.icon}</span>
              <p className="text-[12px] font-bold text-pink-600">{p.nom}</p>
              <p className="mt-1 text-[10px] text-content-secondary">{p.adresse}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="rounded-[14px] bg-surface-secondary p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-pink-600">💝</span>
          <p className="text-[13px] font-semibold text-content-primary">Message de la commission</p>
        </div>
        <p className="text-[12px] leading-relaxed text-content-secondary">
          À l&apos;occasion de la journée internationale des femmes, l&apos;amicale vous offre un bon cadeau. Venez le récupérer au local avant la date limite !
        </p>
      </div>
    </div>
  );
}
