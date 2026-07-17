"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommissionItems } from "@/hooks/use-commission-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface StockItem {
  nom: string;
  categorie: string;
  qte: number;
  seuil: number;
}

interface Abonnement {
  nom: string;
  type: string;
  cout: number;
  renouvellement: string;
  statut: "actif" | "suspendu";
}

interface Jeu {
  nom: string;
  type: string;
  joueurs: string;
  etat: "bon" | "moyen" | "abime";
}

const DEMO_STOCK: StockItem[] = [
  { nom: "Café moulu", categorie: "Boissons chaudes", qte: 3, seuil: 2 },
  { nom: "Capsules Nespresso", categorie: "Boissons chaudes", qte: 45, seuil: 20 },
  { nom: "Thé (assortiment)", categorie: "Boissons chaudes", qte: 25, seuil: 10 },
  { nom: "Sucre", categorie: "Boissons chaudes", qte: 4, seuil: 2 },
  { nom: "Coca-Cola (33cl)", categorie: "Boissons froides", qte: 18, seuil: 12 },
  { nom: "Eau (1.5L)", categorie: "Boissons froides", qte: 6, seuil: 6 },
  { nom: "Jus d'orange (1L)", categorie: "Boissons froides", qte: 4, seuil: 3 },
  { nom: "Bière (33cl)", categorie: "Boissons froides", qte: 24, seuil: 12 },
  { nom: "Chips", categorie: "Snacks", qte: 8, seuil: 5 },
  { nom: "Chocolat", categorie: "Snacks", qte: 6, seuil: 3 },
  { nom: "Gobelets", categorie: "Consommables", qte: 150, seuil: 50 },
  { nom: "Détergent", categorie: "Consommables", qte: 2, seuil: 1 },
];

const DEMO_ABONNEMENTS: Abonnement[] = [
  { nom: "Canal+", type: "TV", cout: 39.99, renouvellement: "2026-09-01", statut: "actif" },
  { nom: "Netflix", type: "Streaming", cout: 13.49, renouvellement: "2026-08-15", statut: "actif" },
  { nom: "Orange Fibre", type: "Internet", cout: 29.99, renouvellement: "2026-12-01", statut: "actif" },
  { nom: "Spotify Premium", type: "Musique", cout: 9.99, renouvellement: "2026-08-01", statut: "suspendu" },
];

const DEMO_JEUX: Jeu[] = [
  { nom: "Monopoly", type: "societe", joueurs: "2-6", etat: "bon" },
  { nom: "Uno", type: "societe", joueurs: "2-10", etat: "bon" },
  { nom: "FIFA 26", type: "console", joueurs: "1-4", etat: "bon" },
  { nom: "Mario Kart", type: "console", joueurs: "1-4", etat: "bon" },
  { nom: "Fléchettes", type: "flechettes", joueurs: "1-8", etat: "moyen" },
  { nom: "Baby-foot", type: "societe", joueurs: "2-4", etat: "bon" },
];

const CAT_ICONS: Record<string, string> = {
  "Boissons chaudes": "☕",
  "Boissons froides": "\u{1F964}",
  "Snacks": "\u{1F37F}",
  "Consommables": "\u{1F9F9}",
};

const TYPE_ICONS: Record<string, string> = {
  TV: "\u{1F4FA}", Streaming: "\u{1F3AC}", Internet: "\u{1F310}", Musique: "\u{1F3B5}",
};

const JEU_ICONS: Record<string, string> = {
  societe: "\u{1F3B2}", console: "\u{1F3AE}", flechettes: "\u{1F3AF}",
};

type Tab = "tableau" | "stock" | "abonnements" | "jeux" | "budget";

export function FoyerBureau({ budget = 2000, commissionId }: { budget?: number; commissionId: string }) {
  const [tab, setTab] = useState<Tab>("tableau");

  const { items: dbStock, loading: stockLoading, add: addStockItem, update: updateStockItem, remove: removeStockItem } = useCommissionItems(commissionId, "stock");
  const { items: dbAbonnements, loading: aboLoading, add: addAboItem, update: updateAboItem, remove: removeAboItem } = useCommissionItems(commissionId, "subscription");
  const { items: dbJeux, loading: jeuxLoading, add: addJeuItem, update: updateJeuItem, remove: removeJeuItem } = useCommissionItems(commissionId, "game");

  const stock: StockItem[] = dbStock.length > 0
    ? dbStock.map((i) => ({
        nom: i.name as string ?? "",
        categorie: (i.metadata as any)?.categorie ?? "",
        qte: i.quantity as number ?? 0,
        seuil: i.threshold as number ?? 0,
      }))
    : DEMO_STOCK;

  const abonnements: Abonnement[] = dbAbonnements.length > 0
    ? dbAbonnements.map((i) => ({
        nom: i.name as string ?? "",
        type: (i.metadata as any)?.type ?? "",
        cout: (i.metadata as any)?.cout ?? 0,
        renouvellement: (i.metadata as any)?.renouvellement ?? "",
        statut: ((i.metadata as any)?.statut ?? "actif") as Abonnement["statut"],
      }))
    : DEMO_ABONNEMENTS;

  const jeux: Jeu[] = dbJeux.length > 0
    ? dbJeux.map((i) => ({
        nom: i.name as string ?? "",
        type: (i.metadata as any)?.type ?? "societe",
        joueurs: (i.metadata as any)?.joueurs ?? "",
        etat: ((i.metadata as any)?.etat ?? "bon") as Jeu["etat"],
      }))
    : DEMO_JEUX;

  const totalAbo = abonnements.filter((a) => a.statut === "actif").reduce((s, a) => s + a.cout, 0);
  const alertes = stock.filter((s) => s.qte <= s.seuil);

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "\u{1F4CA}", label: "Tableau" },
    { key: "stock", icon: "\u{1F4E6}", label: "Stock" },
    { key: "abonnements", icon: "\u{1F4FA}", label: "Abonnements" },
    { key: "jeux", icon: "\u{1F3AE}", label: "Jeux" },
    { key: "budget", icon: "\u{1F4B0}", label: "Budget" },
  ];

  const categories = [...new Set(stock.map((s) => s.categorie))];

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key ? "bg-teal-600 text-white shadow-sm" : "bg-surface-elevated text-content-secondary")}>
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
              <p className="text-[18px] font-bold text-teal-600">{stock.length}</p>
              <p className="text-[11px] text-content-muted">Produits</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-content-primary">{abonnements.filter((a) => a.statut === "actif").length}</p>
              <p className="text-[11px] text-content-muted">Abonnements</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-amber-600">{alertes.length}</p>
              <p className="text-[11px] text-content-muted">Alertes stock</p>
            </div>
          </div>

          {alertes.length > 0 && (
            <div className="rounded-[14px] bg-amber-50 p-3 dark:bg-amber-900/20">
              <p className="mb-2 text-[12px] font-bold text-amber-700">Stock bas</p>
              {alertes.map((a, i) => (
                <p key={i} className="text-[11px] text-amber-600">
                  {CAT_ICONS[a.categorie] || "\u{1F4E6}"} {a.nom} &mdash; {a.qte} restant(s) (seuil : {a.seuil})
                </p>
              ))}
            </div>
          )}

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">Co&#251;t mensuel abonnements</p>
            <p className="text-[20px] font-bold text-teal-600">{fmt(totalAbo)}<span className="text-[12px] font-normal text-content-muted"> /mois</span></p>
          </div>
        </div>
      )}

      {/* STOCK */}
      {tab === "stock" && (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat} className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
              <p className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-content-muted">
                <span>{CAT_ICONS[cat] || "\u{1F4E6}"}</span>{cat}
              </p>
              {stock.filter((s) => s.categorie === cat).map((s, i) => (
                <div key={i} className="flex items-center justify-between border-b border-surface-secondary py-2 last:border-0">
                  <p className="text-[13px] text-content-primary">{s.nom}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold",
                      s.qte <= s.seuil ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" : "bg-green-100 text-green-700 dark:bg-green-900/30")}>
                      {s.qte}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ABONNEMENTS */}
      {tab === "abonnements" && (
        <div className="flex flex-col gap-2">
          {abonnements.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[a.type] || "\u{1F4E6}"}</span>
                <div>
                  <p className="text-[13px] font-bold text-content-primary">{a.nom}</p>
                  <p className="text-[11px] text-content-muted">{a.type} &#183; Renouvellement : {new Date(a.renouvellement).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-content-primary">{fmt(a.cout)}/mois</p>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                  a.statut === "actif" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-gray-100 text-gray-500 dark:bg-gray-800")}>
                  {a.statut === "actif" ? "Actif" : "Suspendu"}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-2 rounded-[14px] bg-teal-50 p-3 text-center dark:bg-teal-900/20">
            <p className="text-[12px] text-content-muted">Total mensuel actif</p>
            <p className="text-[18px] font-bold text-teal-600">{fmt(totalAbo)}</p>
          </div>
        </div>
      )}

      {/* JEUX */}
      {tab === "jeux" && (
        <div className="flex flex-col gap-2">
          {jeux.map((j, i) => (
            <div key={i} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{JEU_ICONS[j.type] || "\u{1F3B2}"}</span>
                <div>
                  <p className="text-[13px] font-bold text-content-primary">{j.nom}</p>
                  <p className="text-[11px] text-content-muted">{j.joueurs} joueurs</p>
                </div>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                j.etat === "bon" ? "bg-green-100 text-green-700 dark:bg-green-900/30" :
                j.etat === "moyen" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                "bg-red-100 text-red-600 dark:bg-red-900/30")}>
                {j.etat === "bon" ? "Bon état" : j.etat === "moyen" ? "Moyen" : "Abîmé"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* BUDGET */}
      {tab === "budget" && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Synth&#232;se budg&#233;taire</p>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Budget annuel</span>
            <span className="text-[13px] font-bold text-content-primary">{fmt(budget)}</span>
          </div>
          <div className="flex justify-between border-b border-surface-secondary py-2">
            <span className="text-[12px] text-content-secondary">Abonnements annuels</span>
            <span className="text-[13px] font-bold text-red-600">{fmt(totalAbo * 12)}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="text-[12px] font-bold text-content-primary">Reste pour stock & jeux</span>
            <span className={cn("text-[15px] font-bold", budget - totalAbo * 12 >= 0 ? "text-green-600" : "text-red-600")}>
              {fmt(budget - totalAbo * 12)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
