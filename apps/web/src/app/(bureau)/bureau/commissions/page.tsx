import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GradientHeader } from "@/components/layout/gradient-header";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export default async function CommissionsPage() {
  const supabase = await createClient();
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, commission_members(count)")
    .eq("active", true)
    .order("is_fixed", { ascending: false })
    .order("name");

  const list = commissions ?? [];
  const total = list.length;
  const fixed = list.filter((c) => c.is_fixed).length;
  const budgetTotal = list.reduce(
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

      {/* Stats row */}
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

      {list.length === 0 ? (
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
                  ? c.commission_members.length
                  : (c.commission_members as { count: number }[])?.[0]?.count ?? 0
              }
              isFixed={c.is_fixed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
