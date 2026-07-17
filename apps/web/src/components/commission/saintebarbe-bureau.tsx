"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Inscription {
  id: string;
  nom: string;
  invites: number;
  choixRepas: string;
  paye: boolean;
}

interface PrestataireItem {
  nom: string;
  type: string;
  devis: number;
  reel: number;
  statut: "devis_recu" | "commande" | "confirme" | "paye";
}

const DEMO_INSCRIPTIONS: Inscription[] = [
  { id: "1", nom: "Durand Pierre", invites: 3, choixRepas: "Menu standard", paye: true },
  { id: "2", nom: "Martin Sophie", invites: 1, choixRepas: "Menu végétarien", paye: true },
  { id: "3", nom: "Bernard Luc", invites: 2, choixRepas: "Menu standard", paye: false },
  { id: "4", nom: "Petit Claire", invites: 0, choixRepas: "Menu standard", paye: true },
  { id: "5", nom: "Moreau Jean", invites: 4, choixRepas: "Menu standard", paye: false },
];

const DEMO_PRESTATAIRES: PrestataireItem[] = [
  { nom: "Traiteur Dupont", type: "traiteur", devis: 2800, reel: 2800, statut: "confirme" },
  { nom: "Salle des fêtes", type: "salle", devis: 500, reel: 500, statut: "paye" },
  { nom: "DJ Max", type: "musique", devis: 800, reel: 0, statut: "devis_recu" },
  { nom: "Déco Express", type: "decoration", devis: 350, reel: 350, statut: "commande" },
  { nom: "Photo Studio", type: "photo", devis: 400, reel: 0, statut: "devis_recu" },
];

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  devis_recu: { label: "Devis reçu", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30" },
  commande: { label: "Commandé", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30" },
  confirme: { label: "Confirmé", color: "bg-green-100 text-green-700 dark:bg-green-900/30" },
  paye: { label: "Payé", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" },
};

const TYPE_ICONS: Record<string, string> = {
  traiteur: "🍽️", salle: "🏛️", musique: "🎵", animation: "🎭",
  decoration: "🎨", photo: "📸", boissons: "🍷", divers: "📦",
};

type Tab = "tableau" | "inscriptions" | "repas" | "prestataires" | "budget";

export function SainteBarbeBureau({ budget = 5000 }: { budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const [inscriptions] = useState(DEMO_INSCRIPTIONS);
  const [prestataires] = useState(DEMO_PRESTATAIRES);

  const totalInscrits = inscriptions.reduce((s, i) => s + 1 + i.invites, 0);
  const totalPaye = inscriptions.filter((i) => i.paye).length;
  const totalDevis = prestataires.reduce((s, p) => s + p.devis, 0);

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "📊", label: "Tableau" },
    { key: "inscriptions", icon: "📋", label: "Inscriptions" },
    { key: "repas", icon: "🍽️", label: "Repas" },
    { key: "prestataires", icon: "🏪", label: "Prestataires" },
    { key: "budget", icon: "💰", label: "Budget" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-red-600 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
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
              <p className="text-[18px] font-bold text-red-600">{totalInscrits}</p>
              <p className="text-[11px] text-content-muted">Convives</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-content-primary">{inscriptions.length}</p>
              <p className="text-[11px] text-content-muted">Foyers</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-green-600">{totalPaye}</p>
              <p className="text-[11px] text-content-muted">Payés</p>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Informations</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] bg-red-100 dark:bg-red-900/30">
                <span className="text-[15px] font-bold leading-none text-red-600">4</span>
                <span className="text-[9px] uppercase text-red-600">Déc</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-content-primary">Sainte-Barbe 2026</p>
                <p className="text-[11px] text-content-secondary">Sam. 4 déc. 2026 · 19h00 · Salle des fêtes</p>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Configuration</p>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {[
                ["Capacité", "120 places"],
                ["Max invités/foyer", "4"],
                ["Tarif adulte", "25 €"],
                ["Tarif enfant", "12 €"],
                ["Date limite", "28 nov. 2026"],
                ["Budget prévu", fmt(budget)],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between rounded-[10px] bg-surface-secondary px-3 py-2">
                  <span className="text-content-muted">{k}</span>
                  <span className="font-semibold text-content-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSCRIPTIONS */}
      {tab === "inscriptions" && (
        <div className="flex flex-col gap-2">
          {inscriptions.map((ins) => (
            <div key={ins.id} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30">
                  {1 + ins.invites}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{ins.nom}</p>
                  <p className="text-[11px] text-content-muted">{ins.invites} invité{ins.invites > 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                ins.paye ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30")}>
                {ins.paye ? "Payé" : "En attente"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* REPAS */}
      {tab === "repas" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-content-primary">{inscriptions.filter((i) => i.choixRepas === "Menu standard").length}</p>
              <p className="text-[11px] text-content-muted">Menu standard</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-green-600">{inscriptions.filter((i) => i.choixRepas === "Menu végétarien").length}</p>
              <p className="text-[11px] text-content-muted">Menu végétarien</p>
            </div>
          </div>
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Menu de la soirée</p>
            {["Apéritif : Kir royal, verrines", "Entrée : Foie gras, toast briochés", "Plat : Filet mignon, gratin dauphinois", "Dessert : Bûche de Noël artisanale"].map((item) => (
              <div key={item} className="flex items-center gap-2 border-b border-surface-secondary py-2 last:border-0">
                <span className="text-[12px]">🍴</span>
                <p className="text-[13px] text-content-primary">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRESTATAIRES */}
      {tab === "prestataires" && (
        <div className="flex flex-col gap-2">
          {prestataires.map((p, i) => {
            const s = STATUT_LABELS[p.statut]!;
            return (
              <div key={i} className="rounded-[14px] bg-surface-elevated p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_ICONS[p.type] || "📦"}</span>
                    <div>
                      <p className="text-[13px] font-bold text-content-primary">{p.nom}</p>
                      <p className="text-[11px] text-content-muted capitalize">{p.type}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", s.color)}>{s.label}</span>
                </div>
                <div className="mt-2 flex gap-4 text-[11px]">
                  <span className="text-content-muted">Devis : <strong className="text-content-primary">{fmt(p.devis)}</strong></span>
                  {p.reel > 0 && <span className="text-content-muted">Réel : <strong className="text-content-primary">{fmt(p.reel)}</strong></span>}
                </div>
              </div>
            );
          })}
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
            <span className="text-[12px] text-content-secondary">Total devis</span>
            <span className="text-[13px] font-bold text-red-600">{fmt(totalDevis)}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="text-[12px] font-bold text-content-primary">Reste disponible</span>
            <span className={cn("text-[15px] font-bold", budget - totalDevis >= 0 ? "text-green-600" : "text-red-600")}>{fmt(budget - totalDevis)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
