"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Bon {
  id: string;
  nom: string;
  type: "pompier" | "conjointe";
  statut: "attente" | "remis" | "envoye";
}

interface Prestataire {
  nom: string;
  adresse: string;
  categorie: string;
  icon: string;
}

const DEMO_BONS: Bon[] = [
  { id: "1", nom: "Marie Durand", type: "pompier", statut: "remis" },
  { id: "2", nom: "Sophie Martin", type: "conjointe", statut: "remis" },
  { id: "3", nom: "Julie Bernard", type: "pompier", statut: "attente" },
  { id: "4", nom: "Claire Petit", type: "conjointe", statut: "attente" },
  { id: "5", nom: "Nathalie Moreau", type: "conjointe", statut: "envoye" },
  { id: "6", nom: "Isabelle Robert", type: "pompier", statut: "attente" },
];

const DEMO_PRESTATAIRES: Prestataire[] = [
  { nom: "Fleuriste Dupont", adresse: "12 rue du Commerce", categorie: "Fleurs", icon: "🌹" },
  { nom: "Spa Belle Vie", adresse: "Centre-ville, Laval", categorie: "Spa", icon: "🧖" },
  { nom: "Bijouterie Laval", adresse: "Place du Vieux-Saint-Louis", categorie: "Bijoux", icon: "💍" },
  { nom: "Parfumerie Élégance", adresse: "Rue de Bretagne, Laval", categorie: "Parfum", icon: "🌸" },
];

type Tab = "tableau" | "bons" | "prestataires" | "compta";
type BonFilter = "tous" | "pompiers" | "conjointes" | "attente" | "remis" | "envoyes";

export function FdfBureau({ budget = 2000 }: { budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const [prixBon, setPrixBon] = useState(50);
  const [bons, setBons] = useState(DEMO_BONS);
  const [prestataires] = useState(DEMO_PRESTATAIRES);
  const [bonFilter, setBonFilter] = useState<BonFilter>("tous");
  const [search, setSearch] = useState("");

  const totalBons = bons.length * prixBon;
  const reste = budget - totalBons;

  const filteredBons = bons
    .filter((b) => {
      if (bonFilter === "pompiers") return b.type === "pompier";
      if (bonFilter === "conjointes") return b.type === "conjointe";
      if (bonFilter === "attente") return b.statut === "attente";
      if (bonFilter === "remis") return b.statut === "remis";
      if (bonFilter === "envoyes") return b.statut === "envoye";
      return true;
    })
    .filter((b) => !search || b.nom.toLowerCase().includes(search.toLowerCase()));

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "📊", label: "Tableau" },
    { key: "bons", icon: "🎁", label: "Bons" },
    { key: "prestataires", icon: "🏪", label: "Prestataires" },
    { key: "compta", icon: "💰", label: "Compta" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-pink-600 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
              <span className="text-[14px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      {tab === "tableau" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-pink-600">{bons.length}</p>
              <p className="text-[11px] text-content-muted">Bénéficiaires</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-content-primary">{fmt(totalBons)}</p>
              <p className="text-[11px] text-content-muted">Budget bons</p>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Paramètres des bons</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-muted">Valeur du bon (€)</label>
                <input type="number" value={prixBon} onChange={(e) => setPrixBon(Number(e.target.value))}
                  className="w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-muted">Date de remise</label>
                <input type="text" value="8 mars 2026" readOnly
                  className="w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-muted" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-content-muted">Éligibles : femmes pompiers + conjointes de pompiers.</p>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "📋", label: "Générer la liste" },
                { icon: "✉️", label: "Envoyer par courrier" },
                { icon: "📊", label: "Export CSV" },
                { icon: "💬", label: "Message aux membres" },
              ].map((a) => (
                <button key={a.label} type="button"
                  className="flex items-center gap-2 rounded-[12px] bg-surface-secondary px-3 py-2.5 text-[12px] font-medium text-content-secondary transition-colors hover:bg-surface-tertiary">
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BONS */}
      {tab === "bons" && (
        <div className="flex flex-col gap-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un nom..."
            className="w-full rounded-[12px] bg-surface-elevated px-4 py-2.5 text-[13px] text-content-primary shadow-sm" />

          <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-2">
              {([
                ["tous", "Tous"], ["pompiers", "Pompiers"], ["conjointes", "Conjointes"],
                ["attente", "À remettre"], ["remis", "Remis"], ["envoyes", "Envoyés"],
              ] as [BonFilter, string][]).map(([f, label]) => (
                <button key={f} type="button" onClick={() => setBonFilter(f)}
                  className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                    bonFilter === f ? "bg-pink-600 text-white" : "bg-surface-elevated text-content-secondary")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredBons.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-lg dark:bg-pink-900/30">💐</div>
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{b.nom}</p>
                  <p className="text-[11px] text-content-muted">{b.type === "pompier" ? "Pompier" : "Conjointe"} · {fmt(prixBon)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setBons((p) => p.map((x) => x.id === b.id ? { ...x, statut: x.statut === "remis" ? "attente" : "remis" } : x))}
                className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                  b.statut === "remis" ? "bg-green-100 text-green-700 dark:bg-green-900/30" :
                  b.statut === "envoye" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/30")}>
                {b.statut === "remis" ? "Remis" : b.statut === "envoye" ? "Envoyé" : "À remettre"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PRESTATAIRES */}
      {tab === "prestataires" && (
        <div className="flex flex-col gap-3">
          {prestataires.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-pink-100 text-2xl dark:bg-pink-900/30">{p.icon}</div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-content-primary">{p.nom}</p>
                <p className="text-[11px] text-content-muted">{p.adresse}</p>
                <span className="mt-1 inline-block rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-700 dark:bg-pink-900/30">{p.categorie}</span>
              </div>
            </div>
          ))}
          <button type="button" className="w-full rounded-[12px] border border-dashed border-pink-300 py-3 text-[12px] font-semibold text-pink-600 dark:border-pink-700">
            + Ajouter un prestataire
          </button>
        </div>
      )}

      {/* COMPTA */}
      {tab === "compta" && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Synthèse budgétaire</p>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Budget alloué</span>
            <span className="text-[13px] font-bold text-content-primary">{fmt(budget)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Bons cadeaux ({bons.length})</span>
            <span className="text-[13px] font-bold text-red-600">{fmt(totalBons)}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="text-[12px] font-bold text-content-primary">Reste disponible</span>
            <span className={cn("text-[15px] font-bold", reste >= 0 ? "text-green-600" : "text-red-600")}>{fmt(reste)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
