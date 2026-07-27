"use client";

import { useCommissionActivities } from "@/hooks/use-commission-data";

const ACTION_ICONS: Record<string, string> = {
  collecte: "\u{1F37D}️",
  visite: "\u{1F3E5}",
  evenement_sol: "\u{1F3C3}",
  parrainage: "\u{1F91D}",
  partenariat: "\u{1F4BC}",
};

export function SolidariteAmicaliste({ commissionId }: { commissionId: string }) {
  const { activities: dbActivities, loading } = useCommissionActivities(commissionId, "action_solidaire");

  const actions = dbActivities.map((a) => ({
    titre: (a.title as string) ?? "",
    date: a.date ? new Date(a.date as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "",
    description: (a.description as string) ?? "",
    icon: ACTION_ICONS[(a.metadata as Record<string, unknown>)?.action_type as string ?? ""] ?? "\u{1F91D}",
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-[16px] bg-gradient-to-br from-blue-700 to-blue-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/20">
            <span className="text-2xl">{"\u{1F91D}"}</span>
          </div>
          <div>
            <p className="text-[16px] font-bold text-white">Action sociale & Solidarit&#233;</p>
            <p className="text-[12px] text-white/80">Actions d&apos;entraide de l&apos;amicale</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Actions solidaires</p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="text-[36px]">{"\u{1F91D}"}</span>
            <p className="text-[13px] text-content-muted">Aucune action solidaire en cours</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actions.map((a, i) => (
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
        )}
      </div>

      {/* Info card */}
      <div className="rounded-[14px] bg-surface-secondary p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-blue-600">{"\u{1F4AC}"}</span>
          <p className="text-[13px] font-semibold text-content-primary">Message de la commission</p>
        </div>
        <p className="text-[12px] leading-relaxed text-content-secondary">
          La commission Solidarit&#233; est &#224; votre &#233;coute. N&apos;h&#233;sitez pas &#224; nous contacter pour toute situation n&#233;cessitant un soutien de l&apos;amicale.
        </p>
      </div>
    </div>
  );
}
