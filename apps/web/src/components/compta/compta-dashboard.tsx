"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  type: string;
  label: string;
  amount: string;
  status: string;
  created_at: string;
  commissions: { name: string; icon?: string; color?: string } | null;
}

interface Commission {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  budget: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

const tabs = [
  { id: "tableau", icon: "📊", label: "Tableau" },
  { id: "journal", icon: "📒", label: "Journal" },
  { id: "documents", icon: "📄", label: "Documents" },
  { id: "budgets", icon: "💰", label: "Budgets" },
];

export function ComptaDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [activeTab, setActiveTab] = useState("tableau");

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [entriesRes, commissionsRes] = await Promise.all([
        supabase
          .from("accounting_entries")
          .select("*, commissions:commission_id(name, icon, color)")
          .order("created_at", { ascending: false }),
        supabase
          .from("commissions")
          .select("id, name, icon, color, budget")
          .eq("active", true)
          .order("name"),
      ]);

      if (entriesRes.data) setEntries(entriesRes.data as Entry[]);
      if (commissionsRes.data) setCommissions(commissionsRes.data);
    }
    load();
  }, []);

  const recettes = entries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries
    .filter((e) => e.type !== "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = recettes - depenses;

  const statusBadge = (status: string) => {
    switch (status) {
      case "valide":
        return <Badge variant="success">Validé</Badge>;
      case "recette":
        return <Badge variant="success">Recette</Badge>;
      case "rejete":
        return <Badge variant="danger">Rejeté</Badge>;
      default:
        return <Badge variant="warning">En attente</Badge>;
    }
  };

  const commissionBilan = commissions.map((c) => {
    const commEntries = entries.filter((e) => e.commissions?.name === c.name);
    const rec = commEntries.filter((e) => e.type === "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
    const dep = commEntries.filter((e) => e.type !== "recette").reduce((s, e) => s + parseFloat(e.amount), 0);
    return { ...c, recettes: rec, depenses: dep, solde: rec - dep };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Solde card */}
      <div className="-mt-2 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
          Solde général amicale
        </p>
        <p className={cn(
          "mt-1 text-3xl font-bold tabular-nums",
          solde >= 0 ? "text-emerald-600" : "text-red-600"
        )}>
          {fmt(solde)}
        </p>
        <p className="mt-1 text-[11px] text-content-muted">
          Mis à jour aujourd&apos;hui
        </p>
      </div>

      {/* Icon tabs */}
      <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-surface-elevated text-content-secondary"
              )}
            >
              <span className="text-[14px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Recettes</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">{fmt(recettes)}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Dépenses</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-content-primary">{fmt(depenses)}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Solde</p>
          <p className={cn(
            "mt-1 text-lg font-bold tabular-nums",
            solde >= 0 ? "text-emerald-600" : "text-red-600"
          )}>{fmt(solde)}</p>
        </div>
      </div>

      {/* Bilan par commission */}
      {commissionBilan.length > 0 && (
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Bilan par commission
          </h3>
          <div className="flex flex-col gap-2">
            {commissionBilan.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-[10px] bg-surface-secondary px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: c.color || "#E8553A" }}
                  />
                  <span className="text-[13px] font-medium text-content-primary">
                    {c.icon} {c.name}
                  </span>
                </div>
                <span className={cn(
                  "text-[13px] font-semibold tabular-nums",
                  c.solde >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {c.solde >= 0 ? "+" : ""}{fmt(c.solde)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal des opérations */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Dernières opérations
        </h3>
        {entries.length === 0 ? (
          <EmptyState
            icon="💰"
            title="Aucune opération"
            description="Les opérations comptables apparaîtront ici"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-[10px] bg-surface-secondary px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-content-primary">
                      {entry.label}
                    </span>
                    {statusBadge(entry.status)}
                  </div>
                  <p className="mt-0.5 text-[11px] text-content-muted">
                    {entry.commissions?.icon} {entry.commissions?.name} &middot;{" "}
                    {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-[13px] font-semibold tabular-nums",
                    entry.type === "recette"
                      ? "text-emerald-600"
                      : "text-content-primary"
                  )}
                >
                  {entry.type === "recette" ? "+" : "-"}
                  {fmt(parseFloat(entry.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
