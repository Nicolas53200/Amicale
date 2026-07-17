"use client";

const DEMO_ACTIONS = [
  { titre: "Collecte alimentaire", date: "10 déc. 2026", description: "Collecte de Noël pour les Restos du Coeur", icon: "🍽️" },
  { titre: "Visite hôpital enfants", date: "1 juin 2026", description: "Visite au CHU, remise de cadeaux aux enfants hospitalisés", icon: "🏥" },
  { titre: "Course solidaire", date: "15 oct. 2026", description: "Course caritative au profit du Téléthon", icon: "🏃" },
];

export function SolidariteAmicaliste() {
  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-[16px] bg-gradient-to-br from-blue-700 to-blue-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/20">
            <span className="text-2xl">🤝</span>
          </div>
          <div>
            <p className="text-[16px] font-bold text-white">Action sociale & Solidarité</p>
            <p className="text-[12px] text-white/80">Actions d&apos;entraide de l&apos;amicale</p>
          </div>
        </div>
      </div>

      {/* Actions à venir */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Actions solidaires</p>
        <div className="flex flex-col gap-3">
          {DEMO_ACTIONS.map((a, i) => (
            <div key={i} className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-blue-100 text-xl dark:bg-blue-900/30">
                  {a.icon}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-content-primary">{a.titre}</p>
                  <p className="text-[11px] text-blue-600">{a.date}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-content-secondary">{a.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-[14px] bg-surface-secondary p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-blue-600">💬</span>
          <p className="text-[13px] font-semibold text-content-primary">Message de la commission</p>
        </div>
        <p className="text-[12px] leading-relaxed text-content-secondary">
          La commission Solidarité est à votre écoute. N&apos;hésitez pas à nous contacter pour toute situation nécessitant un soutien de l&apos;amicale.
        </p>
      </div>
    </div>
  );
}
