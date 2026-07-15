"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ModuleComptaProps {
  commissionId: string;
  commissionName: string;
  budget: number;
  isReadOnly?: boolean;
}

interface Entry {
  id: string;
  type: string;
  label: string;
  amount: string;
  status: string;
  created_at: string;
  document_url?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);

export function ModuleCompta({
  commissionId,
  commissionName,
  budget,
  isReadOnly = false,
}: ModuleComptaProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [type, setType] = useState<"facture" | "recette" | "caution">("facture");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadEntries = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("accounting_entries")
      .select("*")
      .eq("commission_id", commissionId)
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
  }, [commissionId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const recettes = entries
    .filter((e) => e.type === "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const depenses = entries
    .filter((e) => e.type !== "recette")
    .reduce((s, e) => s + parseFloat(e.amount), 0);
  const solde = budget + recettes - depenses;
  const consumption = budget > 0 ? (depenses / budget) * 100 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !amount.trim()) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const orgId = user?.user_metadata?.org_id;

    await supabase.from("accounting_entries").insert({
      org_id: orgId,
      commission_id: commissionId,
      type,
      label: label.trim(),
      amount: parseFloat(amount),
      status: type === "recette" ? "recette" : "attente",
    });

    setLabel("");
    setAmount("");
    setSubmitting(false);
    loadEntries();
  }

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
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Budget" value={fmt(budget)} />
        <StatCard label="Recettes" value={fmt(recettes)} />
        <StatCard label="Dépenses" value={fmt(depenses)} />
        <StatCard label="Solde" value={fmt(solde)} />
      </div>

      {budget > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span>Consommation du budget</span>
            <span className="tabular-nums">{Math.round(consumption)}%</span>
          </div>
          <Progress value={consumption} />
        </div>
      )}

      {!isReadOnly && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-surface-elevated p-4 shadow-sm"
        >
          <p className="mb-3 text-sm font-semibold text-content-primary">
            Nouvelle opération
          </p>
          <div className="mb-3 flex gap-1 rounded-lg bg-surface-secondary p-1">
            {(["facture", "recette", "caution"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 rounded-[14px] px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  type === t
                    ? "bg-surface-elevated text-content-primary shadow-sm"
                    : "text-content-muted hover:text-content-secondary"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
            <Input
              placeholder="Libellé"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Button type="submit" disabled={submitting} size="default">
              {submitting ? "..." : "Envoyer"}
            </Button>
          </div>
        </form>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-content-primary">
          Historique
        </p>
        {entries.length === 0 ? (
          <EmptyState
            title="Aucune opération"
            description={`Aucune opération comptable pour ${commissionName}`}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-[14px] bg-surface-secondary px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-content-primary">
                      {entry.label}
                    </span>
                    {statusBadge(entry.status)}
                  </div>
                  <p className="mt-0.5 text-xs text-content-muted">
                    {new Date(entry.created_at).toLocaleDateString("fr-FR")} ·{" "}
                    <span className="capitalize">{entry.type}</span>
                  </p>
                </div>
                <p
                  className={cn(
                    "ml-4 text-sm font-semibold tabular-nums",
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
