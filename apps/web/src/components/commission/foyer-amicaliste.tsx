"use client";

const HORAIRES = [
  { jour: "Lundi – Vendredi", heures: "11h30 – 14h00 / 17h00 – 22h00" },
  { jour: "Samedi", heures: "10h00 – 22h00" },
  { jour: "Dimanche", heures: "Fermé" },
];

const JEUX_DISPONIBLES = [
  { nom: "Baby-foot", icon: "⚽", joueurs: "2-4" },
  { nom: "Fléchettes", icon: "🎯", joueurs: "1-8" },
  { nom: "FIFA 26", icon: "🎮", joueurs: "1-4" },
  { nom: "Mario Kart", icon: "🎮", joueurs: "1-4" },
  { nom: "Monopoly", icon: "🎲", joueurs: "2-6" },
  { nom: "Uno", icon: "🃏", joueurs: "2-10" },
];

const BOISSONS = [
  { nom: "Café", icon: "☕", prix: "0,50 €" },
  { nom: "Thé", icon: "🍵", prix: "0,50 €" },
  { nom: "Soda", icon: "🥤", prix: "1,00 €" },
  { nom: "Bière", icon: "🍺", prix: "1,50 €" },
  { nom: "Jus de fruit", icon: "🧃", prix: "1,00 €" },
];

export function FoyerAmicaliste() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-teal-600 to-teal-700 p-5">
        <div className="pointer-events-none absolute -right-4 -top-4 text-[80px] opacity-[0.12]">🏠</div>
        <div className="relative z-10">
          <h2 className="text-[20px] font-extrabold text-white">Le Foyer</h2>
          <p className="mt-1 text-[13px] text-white/80">Votre espace détente</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-[12px] font-semibold text-white">Ouvert</span>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Horaires d&apos;ouverture</p>
        {HORAIRES.map((h, i) => (
          <div key={i} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
            <span className="text-[13px] font-semibold text-content-primary">{h.jour}</span>
            <span className="text-[12px] text-content-secondary">{h.heures}</span>
          </div>
        ))}
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Jeux & activités</p>
        <div className="grid grid-cols-2 gap-2">
          {JEUX_DISPONIBLES.map((j, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-[12px] bg-surface-secondary p-3">
              <span className="text-xl">{j.icon}</span>
              <div>
                <p className="text-[12px] font-semibold text-content-primary">{j.nom}</p>
                <p className="text-[10px] text-content-muted">{j.joueurs} joueurs</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Boissons & tarifs</p>
        {BOISSONS.map((b, i) => (
          <div key={i} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{b.icon}</span>
              <span className="text-[13px] text-content-primary">{b.nom}</span>
            </div>
            <span className="text-[12px] font-bold text-teal-600 dark:text-teal-400">{b.prix}</span>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] bg-teal-50 p-4 dark:bg-teal-900/20">
        <div className="flex items-start gap-3">
          <span className="text-teal-600">ℹ️</span>
          <div>
            <p className="text-[13px] font-semibold text-teal-800 dark:text-teal-300">Règles du foyer</p>
            <p className="mt-1 text-[12px] leading-relaxed text-teal-700 dark:text-teal-400">
              Le foyer est un lieu de convivialité. Merci de respecter le matériel, de ranger après utilisation et de maintenir la propreté des lieux. Les consommations sont à régler à la caisse d&apos;honneur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
