"use client";

import { useCommissionSettings, useCommissionItems } from "@/hooks/use-commission-data";

export function FoyerAmicaliste({ commissionId }: { commissionId: string }) {
  const { settings, loading: settingsLoading } = useCommissionSettings({ commissionId });
  const { items: dbGames, loading: gamesLoading } = useCommissionItems(commissionId, "game");
  const { items: dbBoissons, loading: boissonsLoading } = useCommissionItems(commissionId, "stock");

  const horaires = Array.isArray(settings.horaires) && (settings.horaires as any[]).length > 0
    ? (settings.horaires as { jour: string; heures: string }[])
    : [];

  const jeuxDisponibles = dbGames.map((i) => ({
    nom: i.name as string ?? "",
    icon: (i.metadata as any)?.icon ?? "\u{1F3B2}",
    joueurs: (i.metadata as any)?.joueurs ?? "",
  }));

  const boissons = dbBoissons.map((i) => ({
    nom: i.name as string ?? "",
    icon: (i.metadata as any)?.icon ?? "☕",
    prix: (i.metadata as any)?.prix ?? "",
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-teal-600 to-teal-700 p-5">
        <div className="pointer-events-none absolute -right-4 -top-4 text-[80px] opacity-[0.12]">{"\u{1F3E0}"}</div>
        <div className="relative z-10">
          <h2 className="text-[20px] font-extrabold text-white">Le Foyer</h2>
          <p className="mt-1 text-[13px] text-white/80">{"Votre espace détente"}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-[12px] font-semibold text-white">Ouvert</span>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">{"Horaires d'ouverture"}</p>
        {horaires.length === 0 && (
          <p className="py-2 text-center text-[12px] text-content-muted">{"Horaires non renseignés."}</p>
        )}
        {horaires.map((h, i) => (
          <div key={i} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
            <span className="text-[13px] font-semibold text-content-primary">{h.jour}</span>
            <span className="text-[12px] text-content-secondary">{h.heures}</span>
          </div>
        ))}
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">{"Jeux & activités"}</p>
        {jeuxDisponibles.length === 0 && (
          <p className="py-2 text-center text-[12px] text-content-muted">{"Aucun jeu disponible pour le moment."}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {jeuxDisponibles.map((j, i) => (
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
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">{"Boissons & tarifs"}</p>
        {boissons.length === 0 && (
          <p className="py-2 text-center text-[12px] text-content-muted">{"Aucune boisson renseignée."}</p>
        )}
        {boissons.map((b, i) => (
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
          <span className="text-teal-600">{"\u{2139}\u{FE0F}"}</span>
          <div>
            <p className="text-[13px] font-semibold text-teal-800 dark:text-teal-300">{"Règles du foyer"}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-teal-700 dark:text-teal-400">
              {"Le foyer est un lieu de convivialité. Merci de respecter le matériel, de ranger après utilisation et de maintenir la propreté des lieux. Les consommations sont à régler à la caisse d'honneur."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
