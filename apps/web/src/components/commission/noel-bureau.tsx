"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCommissionItems, useCommissionContacts } from "@/hooks/use-commission-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

interface Bon {
  id: string;
  enfant: string;
  age: number;
  famille: string;
  statut: "attente" | "remis";
}

interface Magasin {
  id?: string;
  nom: string;
  adresse: string;
}

interface Materiel {
  id?: string;
  nom: string;
  qte: number;
  fournisseur: string;
}

interface Achat {
  id?: string;
  lib: string;
  qte: number;
  pu: number;
}

const DEMO_MAGASINS: Magasin[] = [
  { nom: "JouéClub", adresse: "CC des Rochers, Laval" },
  { nom: "La Grande Récré", adresse: "ZC, Saint-Berthevin" },
];

const DEMO_BONS: Bon[] = [
  { id: "1", enfant: "Léo Durand", age: 8, famille: "Durand", statut: "remis" },
  { id: "2", enfant: "Emma Durand", age: 5, famille: "Durand", statut: "remis" },
  { id: "3", enfant: "Lucas Martin", age: 12, famille: "Martin", statut: "attente" },
  { id: "4", enfant: "Chloé Bernard", age: 3, famille: "Bernard", statut: "attente" },
  { id: "5", enfant: "Hugo Bernard", age: 7, famille: "Bernard", statut: "attente" },
  { id: "6", enfant: "Manon Petit", age: 15, famille: "Petit", statut: "attente" },
  { id: "7", enfant: "Jules Moreau", age: 10, famille: "Moreau", statut: "remis" },
  { id: "8", enfant: "Zoé Robert", age: 14, famille: "Robert", statut: "attente" },
];

const DEMO_MATERIEL: Materiel[] = [
  { nom: "Tables pliantes", qte: 8, fournisseur: "Mairie" },
  { nom: "Sono + micro", qte: 1, fournisseur: "Sono53" },
];

const DEMO_ACHATS: Achat[] = [
  { lib: "Plateaux repas traiteur", qte: 45, pu: 12 },
  { lib: "Bonbons et chocolats", qte: 1, pu: 85 },
];

type Tab = "tableau" | "bons" | "logistique" | "compta";
type BonFilter = "tous" | "attente" | "remis" | "limite";

export function NoelBureau({ commissionId, budget = 3000 }: { commissionId: string; budget?: number }) {
  const [tab, setTab] = useState<Tab>("tableau");
  const [prixBon, setPrixBon] = useState(40);
  const [ageLimite, setAgeLimite] = useState(16);
  const [bonFilter, setBonFilter] = useState<BonFilter>("tous");
  const [showMagasinModal, setShowMagasinModal] = useState(false);
  const [magNom, setMagNom] = useState("");
  const [magAdr, setMagAdr] = useState("");

  // Supabase hooks
  const { contacts: dbMagasins, loading: loadingMag, add: addMagasinDb, remove: removeMagasinDb } = useCommissionContacts(commissionId, "magasin");
  const { items: dbBons, loading: loadingBons, update: updateBonDb } = useCommissionItems(commissionId, "voucher");
  const { items: dbMateriel, loading: loadingMat, remove: removeMaterielDb } = useCommissionItems(commissionId, "material");
  const { items: dbAchats, loading: loadingAch, remove: removeAchatDb } = useCommissionItems(commissionId, "stock");

  // Local state for demo fallback (allows local mutations on demo data)
  const [localMagasins, setLocalMagasins] = useState(DEMO_MAGASINS);
  const [localBons, setLocalBons] = useState(DEMO_BONS);
  const [localMateriel, setLocalMateriel] = useState(DEMO_MATERIEL);
  const [localAchats, setLocalAchats] = useState(DEMO_ACHATS);

  // Determine whether to use DB or demo fallback
  const useDbMagasins = !loadingMag && dbMagasins.length > 0;
  const useDbBons = !loadingBons && dbBons.length > 0;
  const useDbMateriel = !loadingMat && dbMateriel.length > 0;
  const useDbAchats = !loadingAch && dbAchats.length > 0;

  // Map DB data to local shape, fall back to demo
  const magasins: Magasin[] = useDbMagasins
    ? dbMagasins.map(c => ({
        id: c.id as string,
        nom: c.name as string,
        adresse: (c.address as string) ?? "",
      }))
    : localMagasins;

  const bons: Bon[] = useDbBons
    ? dbBons.map(i => ({
        id: i.id as string,
        enfant: i.name as string,
        age: ((i.metadata as Record<string, unknown>)?.age as number) ?? 0,
        famille: ((i.metadata as Record<string, unknown>)?.famille as string) ?? "",
        statut: (((i.metadata as Record<string, unknown>)?.statut as string) ?? "attente") as "attente" | "remis",
      }))
    : localBons;

  const materiel: Materiel[] = useDbMateriel
    ? dbMateriel.map(i => ({
        id: i.id as string,
        nom: i.name as string,
        qte: (i.quantity as number) ?? 0,
        fournisseur: ((i.metadata as Record<string, unknown>)?.fournisseur as string) ?? "",
      }))
    : localMateriel;

  const achats: Achat[] = useDbAchats
    ? dbAchats.map(i => ({
        id: i.id as string,
        lib: i.name as string,
        qte: (i.quantity as number) ?? 0,
        pu: (i.price as number) ?? 0,
      }))
    : localAchats;

  const eligibles = bons.filter((b) => b.age <= ageLimite);
  const familles = new Set(eligibles.map((b) => b.famille));
  const totalBons = eligibles.length * prixBon;
  const totalLogistique = achats.reduce((s, a) => s + a.qte * a.pu, 0);
  const reste = budget - totalBons - totalLogistique;

  const filteredBons = eligibles.filter((b) => {
    if (bonFilter === "attente") return b.statut === "attente";
    if (bonFilter === "remis") return b.statut === "remis";
    if (bonFilter === "limite") return b.age >= ageLimite - 1;
    return true;
  });

  // CRUD handlers
  const handleRemoveMagasin = (m: Magasin, i: number) => {
    if (m.id && useDbMagasins) {
      removeMagasinDb(m.id);
    } else {
      setLocalMagasins(p => p.filter((_, j) => j !== i));
    }
  };

  const handleAddMagasin = () => {
    if (magNom) {
      addMagasinDb({ name: magNom, address: magAdr, type: "magasin" });
      setMagNom("");
      setMagAdr("");
      setShowMagasinModal(false);
    }
  };

  const handleToggleBon = (b: Bon) => {
    const newStatut = b.statut === "remis" ? "attente" : "remis";
    if (useDbBons) {
      const dbBon = dbBons.find(d => d.id === b.id);
      if (dbBon) {
        updateBonDb(b.id, {
          metadata: { ...(dbBon.metadata as Record<string, unknown>), statut: newStatut },
        });
      }
    } else {
      setLocalBons(p => p.map(x => x.id === b.id ? { ...x, statut: newStatut } : x));
    }
  };

  const handleRemoveMateriel = (m: Materiel, i: number) => {
    if (m.id && useDbMateriel) {
      removeMaterielDb(m.id);
    } else {
      setLocalMateriel(p => p.filter((_, j) => j !== i));
    }
  };

  const handleRemoveAchat = (a: Achat, i: number) => {
    if (a.id && useDbAchats) {
      removeAchatDb(a.id);
    } else {
      setLocalAchats(p => p.filter((_, j) => j !== i));
    }
  };

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "tableau", icon: "\u{1F4CA}", label: "Tableau" },
    { key: "bons", icon: "\u{1F381}", label: "Bons cadeaux" },
    { key: "logistique", icon: "\u{1F4E6}", label: "Logistique" },
    { key: "compta", icon: "\u{1F4B0}", label: "Compta" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                tab === t.key
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-surface-elevated text-content-secondary"
              )}
            >
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
              <p className="text-[18px] font-bold text-green-700">{eligibles.length}</p>
              <p className="text-[11px] text-content-muted">Enfants éligibles</p>
              <p className="text-[10px] text-content-muted">{familles.size} famille(s)</p>
            </div>
            <div className="rounded-[14px] bg-surface-elevated p-3 text-center shadow-sm">
              <p className="text-[18px] font-bold text-red-600">{eligibles.length}</p>
              <p className="text-[11px] text-content-muted">Bons à prévoir</p>
              <p className="text-[10px] text-content-muted">{fmt(totalBons)}</p>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Paramètres des bons cadeaux</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-muted">Montant du bon (&euro;)</label>
                <input type="number" value={prixBon} onChange={(e) => setPrixBon(Number(e.target.value))}
                  className="w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-content-muted">&Acirc;ge limite (ans)</label>
                <input type="number" value={ageLimite} onChange={(e) => setAgeLimite(Number(e.target.value))}
                  className="w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-content-muted">Les enfants jusqu&apos;à {ageLimite} ans inclus reçoivent un bon cadeau.</p>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Date de l&apos;événement</p>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] bg-green-100 dark:bg-green-900/30">
                <span className="text-[15px] font-bold leading-none text-green-700">14</span>
                <span className="text-[9px] uppercase text-green-700">Déc</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-content-primary">Arbre de Noël de l&apos;amicale</p>
                <p className="text-[11px] text-content-secondary">Sam. 14 déc. 2026 · 14h00 · Salle des fêtes</p>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Magasins partenaires</p>
            <div className="flex flex-col gap-2">
              {magasins.map((m, i) => (
                <div key={m.id ?? i} className="flex items-center justify-between rounded-[12px] bg-surface-secondary px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-semibold text-content-primary">{m.nom}</p>
                    <p className="text-[11px] text-content-muted">{m.adresse}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveMagasin(m, i)}
                    className="text-[11px] text-red-500">Retirer</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowMagasinModal(true)}
              className="mt-3 w-full rounded-[10px] border border-dashed border-green-300 py-2 text-[12px] font-semibold text-green-700 dark:border-green-700">
              + Ajouter un magasin partenaire
            </button>
          </div>
        </div>
      )}

      {/* BONS CADEAUX */}
      {tab === "bons" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 rounded-[14px] bg-green-50 p-3 dark:bg-green-900/20">
            <span className="text-xl">{"\u{1F381}"}</span>
            <p className="text-[12px] text-content-primary"><strong>{eligibles.filter((b) => b.statut === "attente").length} bons</strong> à préparer · les amicalistes viennent les récupérer avant l&apos;arbre de Noël.</p>
          </div>

          <div className="-mx-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-2">
              {(["tous", "attente", "remis", "limite"] as BonFilter[]).map((f) => (
                <button key={f} type="button" onClick={() => setBonFilter(f)}
                  className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all",
                    bonFilter === f ? "bg-green-700 text-white" : "bg-surface-elevated text-content-secondary")}>
                  {{ tous: "Tous", attente: "À remettre", remis: "Remis", limite: "Bientôt hors limite" }[f]}
                </button>
              ))}
            </div>
          </div>

          {filteredBons.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900/30">{"\u{1F381}"}</div>
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{b.enfant}</p>
                  <p className="text-[11px] text-content-muted">{b.age} ans · Famille {b.famille} · {fmt(prixBon)}</p>
                </div>
              </div>
              <button type="button" onClick={() => handleToggleBon(b)}
                className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold",
                  b.statut === "remis" ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30")}>
                {b.statut === "remis" ? "Remis" : "À remettre"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* LOGISTIQUE */}
      {tab === "logistique" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Réservation de matériel</p>
            {materiel.map((m, i) => (
              <div key={m.id ?? i} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{m.nom}</p>
                  <p className="text-[11px] text-content-muted">Qté : {m.qte} · {m.fournisseur}</p>
                </div>
                <button type="button" onClick={() => handleRemoveMateriel(m, i)}
                  className="text-[11px] text-red-500">Retirer</button>
              </div>
            ))}
            <button type="button" className="mt-2 w-full rounded-[10px] border border-dashed border-green-300 py-2 text-[12px] font-semibold text-green-700 dark:border-green-700">
              + Réserver du matériel
            </button>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Plateaux repas & achats</p>
            {achats.map((a, i) => (
              <div key={a.id ?? i} className="flex items-center justify-between border-b border-surface-secondary py-2.5 last:border-0">
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{a.lib}</p>
                  <p className="text-[11px] text-content-muted">{a.qte} × {fmt(a.pu)} = {fmt(a.qte * a.pu)}</p>
                </div>
                <button type="button" onClick={() => handleRemoveAchat(a, i)}
                  className="text-[11px] text-red-500">Retirer</button>
              </div>
            ))}
            <button type="button" className="mt-2 w-full rounded-[10px] border border-dashed border-green-300 py-2 text-[12px] font-semibold text-green-700 dark:border-green-700">
              + Ajouter une commande
            </button>
          </div>
        </div>
      )}

      {/* COMPTA */}
      {tab === "compta" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Synthèse budgétaire</p>
            <div className="flex justify-between border-b border-surface-secondary py-2">
              <span className="text-[12px] text-content-secondary">Budget alloué</span>
              <span className="text-[13px] font-bold text-content-primary">{fmt(budget)}</span>
            </div>
            <div className="flex justify-between border-b border-surface-secondary py-2">
              <span className="text-[12px] text-content-secondary">Bons cadeaux estimés</span>
              <span className="text-[13px] font-bold text-red-600">{fmt(totalBons)}</span>
            </div>
            <div className="flex justify-between border-b border-surface-secondary py-2">
              <span className="text-[12px] text-content-secondary">Logistique engagée</span>
              <span className="text-[13px] font-bold text-red-600">{fmt(totalLogistique)}</span>
            </div>
            <div className="flex justify-between pt-3">
              <span className="text-[12px] font-bold text-content-primary">Reste disponible</span>
              <span className={cn("text-[15px] font-bold", reste >= 0 ? "text-green-600" : "text-red-600")}>{fmt(reste)}</span>
            </div>
          </div>

          <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-content-muted">Envoyer un document au comptable</p>
            <div className="mb-3 flex gap-2">
              {["Facture", "Devis", "Recette"].map((t) => (
                <button key={t} type="button" className="rounded-full bg-surface-secondary px-3 py-1.5 text-[11px] font-semibold text-content-secondary">
                  {t}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Libellé" className="mb-2 w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
            <input type="number" placeholder="Montant (&euro;)" className="mb-2 w-full rounded-[10px] bg-surface-secondary px-3 py-2 text-[13px] text-content-primary" />
            <div className="mb-3 rounded-[12px] border-2 border-dashed border-surface-secondary p-4 text-center">
              <p className="text-[12px] font-semibold text-content-secondary">Joindre le document</p>
              <p className="text-[10px] text-content-muted">PDF, scan · max 10 Mo</p>
            </div>
            <button type="button" className="btn-gradient w-full rounded-full py-2.5 text-[12px] font-semibold text-white">
              Envoyer au comptable
            </button>
          </div>
        </div>
      )}

      {/* Modal magasin */}
      {showMagasinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setShowMagasinModal(false)}>
          <div className="w-full max-w-md rounded-[20px] bg-surface-elevated p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-[15px] font-bold text-content-primary">Magasin partenaire</h3>
            <label className="mb-1 block text-[11px] font-medium text-content-muted">Nom du magasin</label>
            <input type="text" value={magNom} onChange={(e) => setMagNom(e.target.value)} placeholder="ex: JouéClub Laval"
              className="mb-3 w-full rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary" />
            <label className="mb-1 block text-[11px] font-medium text-content-muted">Adresse / ville</label>
            <input type="text" value={magAdr} onChange={(e) => setMagAdr(e.target.value)} placeholder="ex: Centre commercial, Laval"
              className="mb-4 w-full rounded-[10px] bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowMagasinModal(false)}
                className="flex-1 rounded-full bg-surface-secondary py-2.5 text-[12px] font-semibold text-content-secondary">Annuler</button>
              <button type="button" onClick={handleAddMagasin}
                className="flex-1 rounded-full bg-green-700 py-2.5 text-[12px] font-semibold text-white">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
