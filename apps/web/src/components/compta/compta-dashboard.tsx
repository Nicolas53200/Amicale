"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
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
  budget: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

export function ComptaDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
          .select("id, name, icon, budget")
          .eq("active", true)
          .order("name"),
      ]);

      if (entriesRes.data) setEntries(entriesRes.data as Entry[]);
      if (commissionsRes.data) setCommissions(commissionsRes.data);
    }
    load();
  }, []);

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.commissions?.name !== filter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  const budgetTotal = commissions.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );
  const recettes = entries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries
    .filter((e) => e.type !== "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const pending = entries.filter((e) => e.status === "attente").length;

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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Budget total" value={fmt(budgetTotal)} icon="💰" />
        <StatCard label="Recettes" value={fmt(recettes)} icon="📈" />
        <StatCard label="Dépenses" value={fmt(depenses)} icon="📉" />
        <StatCard
          label="En attente"
          value={String(pending)}
          icon="⏳"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-auto"
        >
          <option value="all">Toutes les commissions</option>
          {commissions.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="attente">En attente</option>
          <option value="valide">Validé</option>
          <option value="recette">Recette</option>
          <option value="rejete">Rejeté</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Aucune opération"
          description="Les opérations comptables apparaîtront ici"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-[14px] bg-surface-secondary px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-content-primary">
                    {entry.label}
                  </span>
                  {statusBadge(entry.status)}
                </div>
                <p className="mt-0.5 text-xs text-content-muted">
                  {entry.commissions?.icon} {entry.commissions?.name} ·{" "}
                  {new Date(entry.created_at).toLocaleDateString("fr-FR")} ·{" "}
                  <span className="capitalize">{entry.type}</span>
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
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
  );
}
