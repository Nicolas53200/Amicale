"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommissionActivities, useCommissionContacts } from "@/hooks/use-commission-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Secteur {
  id: string;
  nom: string;
  responsable: string;
  calendriers: number;
  logements: number;
  vendus: number;
  statut: "attribue" | "rendu" | "disponible" | "collectif";
}

interface Retour {
  secteur: string;
  porteur: string;
  date: string;
  vendus: number;
  monnaie: number;
  cheques: number;
  total: number;
}

interface Prestataire {
  id: string;
  nom: string;
  type: string;
  description: string;
  icon: string;
  iconBg: string;
  devis: number;
  devisLabel: string;
  statut: string;
  statutColor: string;
}

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const PHOTO_STATUTS = ["validee","validee","validee","validee","validee","validee","validee","en_attente","en_attente","a_faire","a_faire","a_faire"];

const DEMO_SECTEURS: Secteur[] = [
  { id: "B7", nom: "Les Hauts de Laval", responsable: "Jean Dupont", calendriers: 200, logements: 320, vendus: 180, statut: "attribue" },
  { id: "B8", nom: "Centre-ville", responsable: "Sophie Martin", calendriers: 180, logements: 280, vendus: 180, statut: "rendu" },
  { id: "T1", nom: "Bonchamp", responsable: "Marc Dubois", calendriers: 150, logements: 250, vendus: 150, statut: "rendu" },
  { id: "T2", nom: "Saint-Berthevin", responsable: "Anne Leclerc", calendriers: 160, logements: 240, vendus: 130, statut: "attribue" },
  { id: "T3", nom: "Changé", responsable: "Thomas Blanc", calendriers: 140, logements: 200, vendus: 140, statut: "rendu" },
  { id: "T4", nom: "L'Huisserie", responsable: "Marie Petit", calendriers: 120, logements: 180, vendus: 117, statut: "attribue" },
  { id: "B9", nom: "Zone Sud", responsable: "", calendriers: 130, logements: 190, vendus: 0, statut: "disponible" },
  { id: "T5", nom: "Avenières", responsable: "Pierre Roux", calendriers: 170, logements: 260, vendus: 170, statut: "rendu" },
  { id: "T6", nom: "Louverné", responsable: "Julie Bernard", calendriers: 110, logements: 170, vendus: 100, statut: "attribue" },
  { id: "B10", nom: "Zones commerciales", responsable: "Bureau", calendriers: 200, logements: 0, vendus: 150, statut: "collectif" },
  { id: "T7", nom: "Entrammes", responsable: "Paul Moreau", calendriers: 130, logements: 200, vendus: 0, statut: "attribue" },
  { id: "T8", nom: "Nuillé-sur-Vicoin", responsable: "", calendriers: 80, logements: 120, vendus: 0, statut: "disponible" },
];

const DEMO_RETOURS: Retour[] = [
  { secteur: "T1", porteur: "Marc Dubois", date: "2026-01-15", vendus: 150, monnaie: 720, cheques: 750, total: 1470 },
  { secteur: "T2", porteur: "Anne Leclerc", date: "2026-01-20", vendus: 130, monnaie: 490, cheques: 720, total: 1210 },
  { secteur: "B8", porteur: "Sophie Martin", date: "2026-01-22", vendus: 180, monnaie: 840, cheques: 960, total: 1800 },
  { secteur: "T3", porteur: "Thomas Blanc", date: "2026-01-25", vendus: 140, monnaie: 650, cheques: 810, total: 1460 },
  { secteur: "T5", porteur: "Pierre Roux", date: "2026-02-01", vendus: 170, monnaie: 520, cheques: 1759, total: 2279 },
];

const DEMO_PRESTATAIRES: Prestataire[] = [
  { id: "imp", nom: "Imprimerie Duval", type: "Impression", description: "2 ans de collaboration", icon: "🖨️", iconBg: "bg-blue-100 dark:bg-blue-900/30", devis: 4328, devisLabel: "", statut: "Commande signée", statutColor: "text-green-600" },
  { id: "graph", nom: "Studio Graphik", type: "Conception", description: "1ère année", icon: "🎨", iconBg: "bg-purple-100 dark:bg-purple-900/30", devis: 680, devisLabel: "", statut: "7/12 photos validées", statutColor: "text-amber-600" },
];

const STATUT_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  attribue: { label: "Attribué", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30", dot: "bg-amber-500" },
  rendu: { label: "Rendu", cls: "bg-green-100 text-green-700 dark:bg-green-900/30", dot: "bg-green-500" },
  disponible: { label: "Disponible", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800", dot: "bg-gray-400" },
  collectif: { label: "Collectif", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30", dot: "bg-blue-500" },
};

type Tab = "tableau" | "secteurs" | "retours" | "conception" | "prestataires" | "compta";

export function CalendriersBureau({ commissionId, budget = 15148 }: { commissionId: string; budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const [search, setSearch] = useState("");
  const [selectedSecteur, setSelectedSecteur] = useState<Secteur | null>(null);

  const { activities: dbSecteurs, loading: secteursLoading, add: addSecteur, update: updateSecteur, remove: removeSecteur } = useCommissionActivities(commissionId, "calendar_sector");
  const { activities: dbRetours, loading: retoursLoading, add: addRetour, update: updateRetour, remove: removeRetour } = useCommissionActivities(commissionId, "calendar_return");
  const { contacts: dbPrestataires, loading: prestatauresLoading, add: addPrestataire, remove: removePrestataire } = useCommissionContacts(commissionId, "prestataire");

  const secteurs: Secteur[] = dbSecteurs.length > 0
    ? dbSecteurs.map((a) => {
        const meta = (a.metadata ?? {}) as Record<string, unknown>;
        return {
          id: a.id as string,
          nom: a.title as string,
          responsable: meta.responsable as string ?? "",
          calendriers: meta.total as number ?? 0,
          logements: meta.logements as number ?? 0,
          vendus: meta.vendus as number ?? 0,
          statut: a.status as "attribue" | "rendu" | "disponible" | "collectif",
        };
      })
    : DEMO_SECTEURS;

  const retours: Retour[] = dbRetours.length > 0
    ? dbRetours.map((a) => {
        const meta = (a.metadata ?? {}) as Record<string, unknown>;
        return {
          secteur: a.title as string,
          porteur: meta.porteur as string ?? "",
          date: a.date as string,
          vendus: meta.vendus as number ?? 0,
          monnaie: meta.monnaie as number ?? 0,
          cheques: meta.cheques as number ?? 0,
          total: (meta.monnaie as number ?? 0) + (meta.cheques as number ?? 0),
        };
      })
    : DEMO_RETOURS;

  const prestataires: Prestataire[] = dbPrestataires.length > 0
    ? dbPrestataires.map((c) => {
        const meta = (c.metadata ?? {}) as Record<string, unknown>;
        return {
          id: c.id as string,
          nom: c.name as string,
          type: meta.type as string ?? "",
          description: meta.description as string ?? "",
          icon: meta.icon as string ?? "🏪",
          iconBg: meta.iconBg as string ?? "bg-blue-100 dark:bg-blue-900/30",
          devis: meta.devis as number ?? 0,
          devisLabel: meta.devisLabel as string ?? "",
          statut: meta.statut as string ?? "",
          statutColor: meta.statutColor as string ?? "text-content-primary",
        };
      })
    : DEMO_PRESTATAIRES;

  const totalCal = secteurs.reduce((s, sec) => s + sec.calendriers, 0);
  const totalVendus = secteurs.reduce((s, sec) => s + sec.vendus, 0);
  const totalRecolte = retours.reduce((s, r) => s + r.total, 0);
  const secteursRendus = secteurs.filter((s) => s.statut === "rendu").length;
  const pct = totalCal > 0 ? Math.round((totalVendus / totalCal) * 100) : 0;
  const totalMonnaie = retours.reduce((s, r) => s + r.monnaie, 0);
  const totalCheques = retours.reduce((s, r) => s + r.cheques, 0);

  const filteredSecteurs = search
    ? secteurs.filter((s) => `${s.id} ${s.nom} ${s.responsable}`.toLowerCase().includes(search.toLowerCase()))
    : secteurs;

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "📊", label: "Tableau" },
    { key: "secteurs", icon: "🗺️", label: "Secteurs" },
    { key: "retours", icon: "💰", label: "Retours" },
    { key: "conception", icon: "📷", label: "Conc." },
    { key: "prestataires", icon: "🏪", label: "Presta." },
    { key: "compta", icon: "🧮", label: "Compta." },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-brand-600 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
              <span className="text-[14px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[11px] text-content-muted">Vendus</p>
          <p className="text-[18px] font-bold text-green-600">{totalVendus.toLocaleString("fr-FR")}</p>
          <p className="text-[10px] text-content-muted">sur {totalCal.toLocaleString("fr-FR")}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
          <p className="text-[11px] text-content-muted">Récolté</p>
          <p className="text-[18px] font-bold text-brand-600">{fmt(totalRecolte)}</p>
          <p className="text-[10px] text-content-muted">{secteursRendus} secteurs rendus</p>
        </div>
      </div>

      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="mb-1 flex items-end justify-between">
          <span className="text-[12px] font-semibold text-content-primary">Avancement global</span>
          <span className="text-[13px] font-bold text-brand-600">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-secondary">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-content-muted">
          <span>{totalVendus.toLocaleString("fr-FR")} vendus · {(totalCal - totalVendus).toLocaleString("fr-FR")} restants</span>
          <span>Objectif : {fmt(budget)}</span>
        </div>
      </div>

      {/* TABLEAU */}
      {tab === "tableau" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { n: secteurs.filter((s) => s.statut === "attribue").length, label: "attribués", color: "text-amber-500" },
              { n: secteursRendus, label: "rendus", color: "text-green-600" },
              { n: secteurs.filter((s) => s.statut === "disponible").length, label: "disponibles", color: "text-content-primary" },
              { n: secteurs.filter((s) => s.statut === "collectif").length, label: "collectif", color: "text-blue-600" },
            ].map((s, i) => (
              <div key={i} className="rounded-[12px] bg-surface-elevated p-2.5 text-center shadow-sm">
                <p className={cn("text-[18px] font-bold", s.color)}>{s.n}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-content-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                <span className="text-[10px] text-content-muted">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTEURS */}
      {tab === "secteurs" && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="N° secteur, responsable, commune..."
              className="w-full rounded-[12px] border border-border bg-surface-elevated py-2.5 pl-9 pr-3 text-[13px] text-content-primary placeholder:text-content-muted" />
          </div>

          {filteredSecteurs.map((s) => {
            const cfg = STATUT_CONFIG[s.statut];
            const pctSec = s.calendriers > 0 ? Math.round((s.vendus / s.calendriers) * 100) : 0;
            return (
              <button key={s.id} type="button" onClick={() => setSelectedSecteur(selectedSecteur?.id === s.id ? null : s)}
                className="rounded-[14px] bg-surface-elevated p-3 text-left shadow-sm transition-colors active:bg-surface-secondary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-[10px] text-[12px] font-bold", cfg?.cls)}>
                      {s.id}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-content-primary">{s.nom}</p>
                      <p className="text-[11px] text-content-muted">{s.responsable || "Non attribué"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-content-primary">{s.vendus}/{s.calendriers}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", cfg?.cls)}>{cfg?.label}</span>
                  </div>
                </div>
                {selectedSecteur?.id === s.id && (
                  <div className="mt-3 border-t border-surface-secondary pt-3">
                    <div className="mb-2 flex justify-between text-[11px]">
                      <span className="text-content-muted">Avancement</span>
                      <span className="font-bold text-content-primary">{pctSec}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${pctSec}%` }} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-[8px] bg-surface-secondary p-2 text-center">
                        <p className="font-bold text-content-primary">{s.calendriers}</p>
                        <p className="text-content-muted">Calendriers</p>
                      </div>
                      <div className="rounded-[8px] bg-surface-secondary p-2 text-center">
                        <p className="font-bold text-content-primary">{s.logements}</p>
                        <p className="text-content-muted">Logements</p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* RETOURS */}
      {tab === "retours" && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Retours enregistrés</p>
          {retours.map((r, i) => (
            <div key={i} className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-content-primary">{r.secteur} — {r.porteur}</p>
                  <p className="text-[11px] text-content-muted">
                    {new Date(r.date).toLocaleDateString("fr-FR")} · {r.vendus} vendus
                  </p>
                </div>
                <span className="text-[14px] font-bold text-green-600">{fmt(r.total)}</span>
              </div>
              <div className="mt-2 flex gap-3 text-[10px] text-content-muted">
                <span>Monnaie: {fmt(r.monnaie)}</span>
                <span>Chèques: {fmt(r.cheques)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONCEPTION */}
      {tab === "conception" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3 shadow-sm">
            <div className="flex h-14 w-10 shrink-0 flex-col items-center justify-center rounded-[6px] bg-brand-500">
              <span className="text-lg text-white">🔥</span>
              <span className="text-[8px] text-white/80">2026</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-content-primary">Calendrier Pompiers 2026</p>
              <p className="text-[11px] text-content-muted">Thème : Interventions marquantes 2025</p>
              <p className="text-[11px] text-content-muted">{totalCal.toLocaleString("fr-FR")} ex. · Livraison 28 oct. 2026</p>
            </div>
          </div>

          <p className="text-[12px] font-bold uppercase tracking-wide text-content-muted">Suivi des 12 photos</p>
          <div className="rounded-[16px] bg-surface-elevated shadow-sm">
            {MOIS.map((mois, i) => {
              const statut = PHOTO_STATUTS[i];
              return (
                <div key={i} className="flex items-center justify-between border-b border-surface-secondary px-4 py-2.5 last:border-0">
                  <span className="text-[12px] text-content-primary">{mois}</span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                    statut === "validee" ? "bg-green-100 text-green-700 dark:bg-green-900/30" :
                    statut === "en_attente" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                    "bg-gray-100 text-gray-500 dark:bg-gray-800")}>
                    {statut === "validee" ? "Validée" : statut === "en_attente" ? "En attente" : "À faire"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRESTATAIRES */}
      {tab === "prestataires" && (
        <div className="flex flex-col gap-3">
          {prestataires.map((p) => (
            <div key={p.id} className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-[10px]", p.iconBg)}>
                  <span className="text-lg">{p.icon}</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{p.nom}</p>
                  <p className="text-[11px] text-content-muted">{p.type} · {p.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-content-secondary">Devis 2026</span>
                  <span className="font-semibold text-content-primary">{fmt(p.devis)}{p.devisLabel ? ` — ${p.devisLabel}` : ""}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-content-secondary">Statut</span>
                  <span className={cn("font-semibold", p.statutColor)}>{p.statut}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPTABILITÉ */}
      {tab === "compta" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Cumul campagne</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[10px] text-content-muted">Monnaie</p>
                <p className="text-[14px] font-bold text-amber-600">{fmt(totalMonnaie)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-content-muted">Chèques</p>
                <p className="text-[14px] font-bold text-blue-600">{fmt(totalCheques)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-content-muted">Autre</p>
                <p className="text-[14px] font-bold text-purple-600">{fmt(0)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-surface-secondary pt-3">
              <span className="text-[12px] font-semibold text-content-primary">Total général</span>
              <span className="text-[18px] font-bold text-brand-600">{fmt(totalRecolte)}</span>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Bilan financier</p>
            {[
              { label: "Recettes réelles", value: fmt(totalRecolte), color: "text-green-600" },
              { label: "Charges impression", value: `- ${fmt(4328)}`, color: "text-red-600" },
              { label: "Charges conception", value: `- ${fmt(680)}`, color: "text-red-600" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between border-b border-surface-secondary py-2 last:border-0">
                <span className="text-[12px] text-content-secondary">{row.label}</span>
                <span className={cn("text-[12px] font-semibold", row.color)}>{row.value}</span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] font-bold text-content-primary">Bénéfice</span>
              <span className={cn("text-[15px] font-bold", totalRecolte - 5008 >= 0 ? "text-green-600" : "text-red-600")}>
                {fmt(totalRecolte - 5008)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
