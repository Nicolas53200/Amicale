"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeader } from "@/components/layout/gradient-header";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

interface CommissionRow {
  id: string;
  name: string;
  model: string;
  icon: string | null;
  color: string | null;
  budget: string;
  is_fixed: boolean;
  active: boolean;
  commission_members: { count: number }[];
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("commissions")
      .select("*, commission_members(count)")
      .order("is_fixed", { ascending: false })
      .order("name");
    setCommissions((data as CommissionRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function toggleVisibility(id: string) {
    const commission = commissions.find((c) => c.id === id);
    if (!commission) return;
    const newActive = !commission.active;

    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
    );

    const { error } = await supabase
      .from("commissions")
      .update({ active: newActive })
      .eq("id", id);

    if (error) {
      setCommissions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !newActive } : c))
      );
      showToast("Erreur lors de la mise à jour", "error");
      return;
    }

    showToast(
      `${commission.name} : ${newActive ? "visible côté amicaliste" : "masquée côté amicaliste"}`,
      "success"
    );
  }

  const list = commissions;
  const activeList = list.filter((c) => c.active);
  const total = list.length;
  const fixed = list.filter((c) => c.is_fixed).length;
  const budgetTotal = activeList.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Commissions"
        subtitle="Organisation interne"
        backHref="/bureau/dashboard"
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{total}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Fixes</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{fixed}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Budget</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-content-primary">{fmt(budgetTotal)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Toutes les commissions
        </h3>
        <Link
          href="/bureau/commissions/new"
          className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
        >
          + Nouvelle
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucune commission"
          description="Créez votre première commission pour commencer"
          action={{ label: "Créer une commission", href: "/bureau/commissions/new" }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <CommissionCard
              key={c.id}
              id={c.id}
              name={c.name}
              model={c.model}
              icon={c.icon}
              color={c.color}
              budget={c.budget}
              memberCount={
                Array.isArray(c.commission_members)
                  ? c.commission_members.length > 0 && typeof c.commission_members[0] === "object" && "count" in c.commission_members[0]
                    ? (c.commission_members[0] as { count: number }).count
                    : c.commission_members.length
                  : 0
              }
              isFixed={c.is_fixed}
              active={c.active}
              onToggleVisibility={toggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
}
