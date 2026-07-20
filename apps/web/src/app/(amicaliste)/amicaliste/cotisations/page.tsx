import { GradientHeader } from "@/components/layout/gradient-header";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const COTISATION = {
  montant: 30,
  annee: 2026,
  statut: "a_jour" as const,
  datePaiement: "15 janv. 2026",
  methode: "Virement bancaire",
};

const HISTORIQUE = [
  { annee: 2026, montant: 30, statut: "paye", date: "15 janv. 2026" },
  { annee: 2025, montant: 30, statut: "paye", date: "12 janv. 2025" },
  { annee: 2024, montant: 25, statut: "paye", date: "8 janv. 2024" },
  { annee: 2023, montant: 25, statut: "paye", date: "20 janv. 2023" },
];

export default function CotisationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Ma cotisation"
        subtitle={`Année ${COTISATION.annee}`}
      />

      {/* Statut actuel */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-emerald-100 dark:bg-emerald-900/30">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-[15px] font-bold text-content-primary">Cotisation {COTISATION.annee}</p>
              <p className="text-[12px] text-content-muted">Payée le {COTISATION.datePaiement}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">{fmt(COTISATION.montant)}</p>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30">
              À jour
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-[14px] bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <span className="text-blue-600">ℹ️</span>
          <div>
            <p className="text-[13px] font-semibold text-blue-800 dark:text-blue-300">Informations</p>
            <p className="mt-1 text-[12px] leading-relaxed text-blue-700 dark:text-blue-400">
              La cotisation annuelle permet de financer les activités de l&apos;amicale : événements, voyages, bons cadeaux et actions solidaires. Son montant est fixé lors de l&apos;assemblée générale.
            </p>
          </div>
        </div>
      </div>

      {/* Détails paiement */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Détails du paiement</p>
        {[
          ["Montant", fmt(COTISATION.montant)],
          ["Date de paiement", COTISATION.datePaiement],
          ["Méthode", COTISATION.methode],
          ["Reçu fiscal", "Disponible"],
        ].map(([label, value]) => (
          <div key={label as string} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
            <span className="text-[12px] text-content-secondary">{label}</span>
            <span className="text-[12px] font-semibold text-content-primary">{value}</span>
          </div>
        ))}
      </div>

      {/* Historique */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Historique</p>
        {HISTORIQUE.map((h) => (
          <div key={h.annee} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30">
                ✓
              </div>
              <div>
                <p className="text-[13px] font-semibold text-content-primary">{h.annee}</p>
                <p className="text-[11px] text-content-muted">{h.date}</p>
              </div>
            </div>
            <span className="text-[13px] font-bold text-content-primary">{fmt(h.montant)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
