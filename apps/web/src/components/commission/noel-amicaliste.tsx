"use client";

import { useCommissionItems, useCommissionContacts } from "@/hooks/use-commission-data";

interface Bon {
  enfant: string;
  age: number;
  montant: number;
  statut: "remis" | "attente";
}

interface MagasinInfo {
  icon: string;
  nom: string;
  adresse: string;
}

const DEMO_BONS: Bon[] = [
  { enfant: "Léo", age: 8, montant: 40, statut: "remis" },
  { enfant: "Emma", age: 5, montant: 40, statut: "attente" },
];

const DEMO_MAGASINS: MagasinInfo[] = [
  { icon: "\u{1F3AA}", nom: "JouéClub", adresse: "CC des Rochers, Laval" },
  { icon: "\u{1F3AE}", nom: "La Grande Récré", adresse: "ZC, Saint-Berthevin" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function NoelAmicaliste({ commissionId }: { commissionId: string }) {
  // Supabase hooks
  const { items: dbBons, loading: loadingBons } = useCommissionItems(commissionId, "voucher");
  const { contacts: dbMagasins, loading: loadingMag } = useCommissionContacts(commissionId, "magasin");

  // Fallback: DB data if available, else demo data
  const bons: Bon[] = !loadingBons && dbBons.length > 0
    ? dbBons.map(i => ({
        enfant: i.name as string,
        age: ((i.metadata as Record<string, unknown>)?.age as number) ?? 0,
        montant: (i.price as number) ?? ((i.metadata as Record<string, unknown>)?.montant as number) ?? 40,
        statut: (((i.metadata as Record<string, unknown>)?.statut as string) ?? "attente") as "remis" | "attente",
      }))
    : DEMO_BONS;

  const magasins: MagasinInfo[] = !loadingMag && dbMagasins.length > 0
    ? dbMagasins.map(c => ({
        icon: ((c.metadata as Record<string, unknown>)?.icon as string) ?? "\u{1F381}",
        nom: c.name as string,
        adresse: (c.address as string) ?? "",
      }))
    : DEMO_MAGASINS;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-[16px] bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-green-700">
            <span className="text-xl text-white">{"\u{1F384}"}</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-green-700">Arbre de Noël 2026</p>
            <p className="text-[12px] text-green-800 dark:text-green-400">14 déc. 2026 · 14h00 · Salle des fêtes, Argentré</p>
          </div>
        </div>
      </div>

      {/* Mes bons cadeaux */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Mes bons cadeaux</p>
        <div className="flex flex-col gap-2">
          {bons.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-[14px] bg-surface-elevated p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900/30">{"\u{1F381}"}</div>
                <div>
                  <p className="text-[13px] font-semibold text-content-primary">{b.enfant} ({b.age} ans)</p>
                  <p className="text-[11px] text-content-muted">Bon de {fmt(b.montant)}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                b.statut === "remis"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
              }`}>
                {b.statut === "remis" ? "Remis" : "À retirer"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dates clés */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Dates clés</p>
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-secondary py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-green-600">{"\u{1F4C5}"}</span>
              <span className="text-[12px] text-content-secondary">Date de l&apos;événement</span>
            </div>
            <span className="text-[12px] font-semibold text-content-primary">14 déc. 2026</span>
          </div>
          <div className="flex items-center justify-between border-b border-surface-secondary py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">{"⏰"}</span>
              <span className="text-[12px] text-content-secondary">Limite d&apos;utilisation</span>
            </div>
            <span className="text-[12px] font-semibold text-amber-600">31 janv. 2027</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-green-600">{"\u{1F4CD}"}</span>
              <span className="text-[12px] text-content-secondary">Retrait des bons</span>
            </div>
            <span className="text-[12px] text-content-primary">Local amicale</span>
          </div>
        </div>
      </div>

      {/* Magasins partenaires */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-content-muted">Magasins partenaires</p>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {magasins.map((m, i) => (
            <div key={i} className="flex min-w-[140px] shrink-0 flex-col items-center rounded-[14px] bg-green-50 p-4 text-center dark:bg-green-900/20">
              <span className="mb-2 text-3xl">{m.icon}</span>
              <p className="text-[12px] font-bold text-green-700">{m.nom}</p>
              <p className="mt-1 text-[10px] text-content-secondary">{m.adresse}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="rounded-[14px] bg-surface-secondary p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-green-600">{"\u{1F4AC}"}</span>
          <p className="text-[13px] font-semibold text-content-primary">Message de la commission</p>
        </div>
        <p className="text-[12px] leading-relaxed text-content-secondary">
          Les bons seront distribués le 14 décembre. Utilisables jusqu&apos;au 31 janvier 2027 dans nos magasins partenaires.
        </p>
      </div>
    </div>
  );
}
