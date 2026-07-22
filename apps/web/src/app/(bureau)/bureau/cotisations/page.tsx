"use client";

import { useState, useEffect } from "react";
import { GradientHeader } from "@/components/layout/gradient-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  getCotisations,
  getCotisationStats,
  generateYearCotisations,
  updateCotisationStatus,
} from "@/lib/actions/cotisations";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface Cotisation {
  id: string;
  member_id: string;
  year: number;
  amount: number;
  status: string;
  paid_at: string | null;
  method: string | null;
  members: Member;
}

interface Stats {
  total: number;
  paye: number;
  exonere: number;
  enAttente: number;
  montantCollecte: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const defaultBadge = { label: "En attente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };

const statusBadge: Record<string, { label: string; cls: string }> = {
  paye: { label: "Payé", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  en_attente: defaultBadge,
  exonere: { label: "Exonéré", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

function getBadge(status: string) {
  return statusBadge[status] ?? defaultBadge;
}

export default function BureauCotisationsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [genAmount, setGenAmount] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [showPayModal, setShowPayModal] = useState<Cotisation | null>(null);
  const [payMethod, setPayMethod] = useState("virement");
  const [acting, setActing] = useState(false);
  const { showToast } = useToast();

  async function loadData() {
    setLoading(true);
    const [cots, st] = await Promise.all([
      getCotisations(year),
      getCotisationStats(year),
    ]);
    setCotisations((cots as Cotisation[]) ?? []);
    setStats(st);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [year]);

  async function handleGenerate() {
    setGenerating(true);
    await generateYearCotisations(year, parseFloat(genAmount));
    showToast(`Cotisations ${year} générées`, "success");
    setShowGenerate(false);
    setGenerating(false);
    loadData();
  }

  async function handleMarkPaid(cotisation: Cotisation) {
    setActing(true);
    await updateCotisationStatus(cotisation.id, "paye", payMethod);
    showToast(`Cotisation de ${cotisation.members.first_name} marquée payée`, "success");
    setShowPayModal(null);
    setActing(false);
    loadData();
  }

  async function handleExonerate(cotisation: Cotisation) {
    await updateCotisationStatus(cotisation.id, "exonere");
    showToast(`${cotisation.members.first_name} exonéré(e)`, "success");
    loadData();
  }

  const filtered = cotisations.filter(
    (c) => filter === "all" || c.status === filter
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Cotisations"
        subtitle={`Année ${year}`}
        backHref="/bureau/dashboard"
      />

      {/* Year selector */}
      <div className="flex items-center gap-2">
        {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYear(y)}
            className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
              year === y
                ? "bg-brand-500 text-white"
                : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-content-muted">Collecté</p>
            <p className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400">
              {fmt(stats.montantCollecte)}
            </p>
          </div>
          <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-content-muted">Taux</p>
            <p className="text-[18px] font-bold text-brand-600 dark:text-brand-400">
              {stats.total > 0 ? Math.round(((stats.paye + stats.exonere) / stats.total) * 100) : 0}%
            </p>
          </div>
          <div className="rounded-[14px] bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Payés</p>
            <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-400">{stats.paye}</p>
          </div>
          <div className="rounded-[14px] bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">En attente</p>
            <p className="text-[16px] font-bold text-amber-700 dark:text-amber-400">{stats.enAttente}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowGenerate(true)}
          className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
        >
          Générer les cotisations {year}
        </button>
      </div>

      {/* Filter tabs */}
      {cotisations.length > 0 && (
        <div className="flex gap-1 rounded-[12px] bg-surface-secondary p-1">
          {[
            { key: "all", label: "Tous" },
            { key: "en_attente", label: "En attente" },
            { key: "paye", label: "Payés" },
            { key: "exonere", label: "Exonérés" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex-1 rounded-[10px] px-3 py-2 text-[11px] font-semibold transition-colors ${
                filter === f.key
                  ? "bg-surface-elevated text-content-primary shadow-sm"
                  : "text-content-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[14px] bg-surface-secondary" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          title="Aucune cotisation"
          description={
            cotisations.length === 0
              ? `Générez les cotisations pour ${year} pour commencer le suivi.`
              : "Aucun résultat pour ce filtre."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => {
            const badge = getBadge(c.status);
            const member = c.members;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[13px] font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                  {member.first_name?.[0]}
                  {member.last_name?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-content-primary">
                    {member.first_name} {member.last_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-content-muted">{fmt(c.amount)}</span>
                  </div>
                </div>
                {c.status === "en_attente" && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPayModal(c);
                        setPayMethod("virement");
                      }}
                      className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      Payé
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExonerate(c)}
                      className="rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    >
                      Exonérer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Generate modal */}
      {showGenerate && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowGenerate(false)}
        >
          <div
            className="w-full max-w-sm rounded-[16px] bg-surface-elevated p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-bold text-content-primary">
              Générer les cotisations {year}
            </h3>
            <p className="mt-1 text-[12px] text-content-muted">
              Crée une cotisation en attente pour chaque membre actif.
            </p>
            <div className="mt-4">
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Montant annuel
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value)}
                  className="w-full rounded-[10px] border border-border bg-surface-primary px-3 py-2.5 text-[13px] text-content-primary focus:border-brand-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-content-muted">
                  &euro;
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGenerate(false)}
                className="rounded-[10px] px-4 py-2 text-[12px] font-semibold text-content-secondary hover:bg-surface-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="btn-gradient rounded-[10px] px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {generating ? "Génération..." : "Générer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark paid modal */}
      {showPayModal && (
        <div
          className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPayModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-[16px] bg-surface-elevated p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[15px] font-bold text-content-primary">
              Enregistrer le paiement
            </h3>
            <p className="mt-1 text-[12px] text-content-muted">
              {showPayModal.members.first_name} {showPayModal.members.last_name} — {fmt(showPayModal.amount)}
            </p>
            <div className="mt-4">
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Méthode de paiement
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-[10px] border border-border bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="virement">Virement bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="prelevement">Prélèvement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPayModal(null)}
                className="rounded-[10px] px-4 py-2 text-[12px] font-semibold text-content-secondary hover:bg-surface-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleMarkPaid(showPayModal)}
                disabled={acting}
                className="rounded-[10px] bg-emerald-500 px-4 py-2 text-[12px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {acting ? "..." : "Confirmer le paiement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
