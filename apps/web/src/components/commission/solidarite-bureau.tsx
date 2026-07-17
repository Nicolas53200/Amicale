"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Aide {
  id: string;
  type: string;
  membre: string;
  date: string;
  montant: number;
  statut: "en_cours" | "realise" | "annule";
  confidentiel: boolean;
  notes: string;
}

interface ActionSol {
  id: string;
  titre: string;
  type: string;
  date: string;
  description: string;
  montant: number;
}

const TYPE_ICONS: Record<string, string> = {
  mariage: "💒", naissance: "👶", retraite: "🎉", promotion: "🎖️",
  hospitalisation: "🏥", deces: "🕊️", difficulte_sociale: "🤝",
  aide_exceptionnelle: "🆘", fleurs: "💐", couronne: "🌿",
  bon_cadeau: "🎁", cheque_cadeau: "💳", don: "❤️",
};

const TYPE_LABELS: Record<string, string> = {
  mariage: "Mariage", naissance: "Naissance", retraite: "Retraite", promotion: "Promotion",
  hospitalisation: "Hospitalisation", deces: "Décès", difficulte_sociale: "Difficulté sociale",
  aide_exceptionnelle: "Aide exceptionnelle", fleurs: "Fleurs", couronne: "Couronne funèbre",
  bon_cadeau: "Bon cadeau", cheque_cadeau: "Chèque cadeau", don: "Don",
};

const ACTION_TYPES: Record<string, string> = {
  collecte: "Collecte", visite: "Visite", parrainage: "Parrainage",
  evenement_sol: "Événement solidaire", partenariat: "Partenariat",
};

const DEMO_AIDES: Aide[] = [
  { id: "1", type: "naissance", membre: "Pierre Durand", date: "2026-06-15", montant: 100, statut: "realise", confidentiel: false, notes: "Naissance de Léo" },
  { id: "2", type: "mariage", membre: "Sophie Martin", date: "2026-07-20", montant: 150, statut: "en_cours", confidentiel: false, notes: "" },
  { id: "3", type: "hospitalisation", membre: "Jean Moreau", date: "2026-05-10", montant: 80, statut: "realise", confidentiel: true, notes: "Envoi de fleurs" },
  { id: "4", type: "retraite", membre: "Michel Robert", date: "2026-09-01", montant: 200, statut: "en_cours", confidentiel: false, notes: "Cadeau de départ" },
  { id: "5", type: "deces", membre: "Famille Petit", date: "2026-04-03", montant: 250, statut: "realise", confidentiel: true, notes: "Couronne et soutien" },
];

const DEMO_ACTIONS: ActionSol[] = [
  { id: "1", titre: "Collecte alimentaire", type: "collecte", date: "2026-12-10", description: "Collecte de Noël pour les Restos du Coeur", montant: 450 },
  { id: "2", titre: "Visite hôpital enfants", type: "visite", date: "2026-06-01", description: "Visite de Noël au CHU, remise de cadeaux", montant: 200 },
  { id: "3", titre: "Course solidaire", type: "evenement_sol", date: "2026-10-15", description: "Course au profit du Téléthon", montant: 1200 },
];

type Tab = "tableau" | "aides" | "actions" | "budget";

export function SolidariteBureau({ budget = 3000 }: { budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const [aides] = useState(DEMO_AIDES);
  const [actions] = useState(DEMO_ACTIONS);
  const [showModal, setShowModal] = useState(false);

  const totalAides = aides.filter((a) => a.statut !== "annule").reduce((s, a) => s + a.montant, 0);
  const totalActions = actions.reduce((s, a) => s + a.montant, 0);

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "📊", label: "Tableau" },
    { key: "aides", icon: "🤝", label: "Aides" },
    { key: "actions", icon: "👥", label: "Actions" },
    { key: "budget", icon: "💰", label: "Budget" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-blue-700 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
              <span className="text-[14px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      {tab === "tableau" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-blue-700">{aides.length}</p>
              <p className="text-[11px] text-content-muted">Aides</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-content-primary">{actions.length}</p>
              <p className="text-[11px] text-content-muted">Actions</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-green-600">{fmt(totalAides + totalActions)}</p>
              <p className="text-[11px] text-content-muted">Engagé</p>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Dernières aides</p>
            {aides.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center gap-3 border-b border-surface-secondary py-2.5 last:border-0">
                <span className="text-lg">{TYPE_ICONS[a.type] || "🤝"}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-content-primary">{a.membre}</p>
                  <p className="text-[11px] text-content-muted">{TYPE_LABELS[a.type]} · {fmt(a.montant)}</p>
                </div>
                {a.confidentiel && <span className="text-[10px] text-amber-600">🔒</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AIDES */}
      {tab === "aides" && (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setShowModal(true)}
            className="mb-1 w-full rounded-[12px] border border-dashed border-blue-300 py-3 text-[12px] font-semibold text-blue-700 dark:border-blue-700">
            + Nouvelle aide
          </button>
          {aides.map((a) => (
            <div key={a.id} className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TYPE_ICONS[a.type] || "🤝"}</span>
                  <div>
                    <p className="text-[13px] font-bold text-content-primary">{a.membre}</p>
                    <p className="text-[11px] text-content-muted">{TYPE_LABELS[a.type]} · {new Date(a.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                  a.statut === "realise" ? "bg-green-100 text-green-700 dark:bg-green-900/30" :
                  a.statut === "annule" ? "bg-red-100 text-red-600 dark:bg-red-900/30" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30")}>
                  {a.statut === "realise" ? "Réalisé" : a.statut === "annule" ? "Annulé" : "En cours"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className="font-semibold text-blue-700">{fmt(a.montant)}</span>
                {a.confidentiel && <span className="flex items-center gap-1 text-amber-600">🔒 Confidentiel</span>}
                {a.notes && <span className="text-content-muted">{a.notes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      {tab === "actions" && (
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <div key={a.id} className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-bold text-content-primary">{a.titre}</p>
                  <p className="text-[11px] text-content-muted">{ACTION_TYPES[a.type]} · {new Date(a.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30">{fmt(a.montant)}</span>
              </div>
              <p className="mt-2 text-[12px] text-content-secondary">{a.description}</p>
            </div>
          ))}
          <button type="button" className="w-full rounded-[12px] border border-dashed border-blue-300 py-3 text-[12px] font-semibold text-blue-700 dark:border-blue-700">
            + Nouvelle action solidaire
          </button>
        </div>
      )}

      {/* BUDGET */}
      {tab === "budget" && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Synthèse budgétaire</p>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Budget alloué</span>
            <span className="text-[13px] font-bold text-content-primary">{fmt(budget)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Aides individuelles</span>
            <span className="text-[13px] font-bold text-red-600">{fmt(totalAides)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Actions solidaires</span>
            <span className="text-[13px] font-bold text-red-600">{fmt(totalActions)}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="text-[12px] font-bold text-content-primary">Reste disponible</span>
            <span className={cn("text-[15px] font-bold", budget - totalAides - totalActions >= 0 ? "text-green-600" : "text-red-600")}>
              {fmt(budget - totalAides - totalActions)}
            </span>
          </div>
        </div>
      )}

      {/* Modal aide (simplified) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setShowModal(false)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[20px] bg-surface-elevated p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-[15px] font-bold text-content-primary">Nouvelle aide</h3>
            <label className="mb-1 block text-[11px] font-medium text-content-muted">Type d&apos;événement</label>
            <select className="mb-3 w-full rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary">
              <option value="">-- Sélectionner --</option>
              <optgroup label="Vie personnelle">
                <option value="mariage">Mariage</option>
                <option value="naissance">Naissance</option>
                <option value="retraite">Retraite</option>
                <option value="promotion">Promotion</option>
              </optgroup>
              <optgroup label="Difficulté">
                <option value="hospitalisation">Hospitalisation</option>
                <option value="deces">Décès</option>
                <option value="difficulte_sociale">Difficulté sociale</option>
              </optgroup>
              <optgroup label="Gestes de l'amicale">
                <option value="fleurs">Fleurs</option>
                <option value="couronne">Couronne funèbre</option>
                <option value="bon_cadeau">Bon cadeau</option>
                <option value="don">Don</option>
              </optgroup>
            </select>
            <label className="mb-1 block text-[11px] font-medium text-content-muted">Amicaliste concerné(e)</label>
            <input type="text" placeholder="Nom prénom" className="mb-3 w-full rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary" />
            <label className="mb-1 block text-[11px] font-medium text-content-muted">Montant (€)</label>
            <input type="number" placeholder="0.00" className="mb-3 w-full rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary" />
            <label className="mb-3 flex items-center gap-2 text-[13px] text-content-secondary">
              <input type="checkbox" className="h-4 w-4 accent-blue-700" />
              Confidentiel — visible commission uniquement
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 rounded-full bg-surface-secondary py-2.5 text-[12px] font-semibold text-content-secondary">Annuler</button>
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 rounded-full bg-blue-700 py-2.5 text-[12px] font-semibold text-white">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
