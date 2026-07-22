"use client";

import { useState, useEffect } from "react";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getMyCotisations } from "@/lib/actions/cotisations";

interface Cotisation {
  id: string;
  year: number;
  amount: number;
  status: string;
  paid_at: string | null;
  method: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const methodLabels: Record<string, string> = {
  virement: "Virement bancaire",
  cheque: "Chèque",
  especes: "Espèces",
  prelevement: "Prélèvement",
  autre: "Autre",
};

const defaultStatus = { label: "En attente", icon: "⏳", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" };

const statusConfig: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  paye: { label: "À jour", icon: "✅", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
  en_attente: defaultStatus,
  exonere: { label: "Exonéré", icon: "🎁", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
};

function getStatusCfg(status: string) {
  return statusConfig[status] ?? defaultStatus;
}

export default function CotisationsPage() {
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCotisations().then((data) => {
      setCotisations(data ?? []);
      setLoading(false);
    });
  }, []);

  const currentYear = new Date().getFullYear();
  const current = cotisations.find((c) => c.year === currentYear);
  const history = cotisations.filter((c) => c.year !== currentYear);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <GradientHeader title="Ma cotisation" subtitle={`Année ${currentYear}`} />
        <div className="h-32 animate-pulse rounded-[16px] bg-surface-secondary" />
        <div className="h-24 animate-pulse rounded-[16px] bg-surface-secondary" />
      </div>
    );
  }

  const cfg = current ? getStatusCfg(current.status) : null;

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader title="Ma cotisation" subtitle={`Année ${currentYear}`} />

      {!current ? (
        <EmptyState
          icon="💳"
          title="Aucune cotisation"
          description="Votre cotisation pour cette année n'a pas encore été générée par le bureau."
        />
      ) : (
        <>
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${cfg!.bg}`}>
                  <span className="text-2xl">{cfg!.icon}</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-content-primary">
                    Cotisation {current.year}
                  </p>
                  <p className="text-[12px] text-content-muted">
                    {current.paid_at
                      ? `Payée le ${new Date(current.paid_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
                      : "Paiement en attente"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[18px] font-bold ${cfg!.text}`}>{fmt(current.amount)}</p>
                <span className={`rounded-full ${cfg!.bg} px-2.5 py-0.5 text-[10px] font-bold ${cfg!.text}`}>
                  {cfg!.label}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <p className="text-[13px] font-semibold text-blue-800 dark:text-blue-300">
                  Informations
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-blue-700 dark:text-blue-400">
                  La cotisation annuelle permet de financer les activités de
                  l&apos;amicale : événements, voyages, bons cadeaux et actions
                  solidaires. Son montant est fixé lors de l&apos;assemblée
                  générale.
                </p>
              </div>
            </div>
          </div>

          {current.status === "paye" && (
            <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
              <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">
                Détails du paiement
              </p>
              {[
                ["Montant", fmt(current.amount)],
                [
                  "Date de paiement",
                  current.paid_at
                    ? new Date(current.paid_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                ],
                ["Méthode", current.method ? methodLabels[current.method] ?? current.method : "—"],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0"
                >
                  <span className="text-[12px] text-content-secondary">{label}</span>
                  <span className="text-[12px] font-semibold text-content-primary">{value}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {history.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">
            Historique
          </p>
          {history.map((h) => {
            const hCfg = getStatusCfg(h.status);
            return (
              <div
                key={h.id}
                className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${hCfg.bg} text-[11px] font-bold ${hCfg.text}`}
                  >
                    {h.status === "paye" ? "✓" : h.status === "exonere" ? "—" : "?"}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-content-primary">{h.year}</p>
                    <p className="text-[11px] text-content-muted">
                      {h.paid_at
                        ? new Date(h.paid_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : hCfg.label}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-content-primary">{fmt(h.amount)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
