import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
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
  const custom = total - fixed;
  const budgetTotal = list.reduce(
    (s, c) => s + parseFloat(c.budget || "0"),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">
            Commissions
          </h1>
          <p className="text-sm text-content-secondary">
            Gérez les commissions de votre amicale
          </p>
        </div>
        <Button asChild>
          <Link href="/bureau/commissions/new">Nouvelle commission</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={String(total)} icon="📋" />
        <StatCard label="Fixes" value={String(fixed)} icon="📌" />
        <StatCard label="Custom" value={String(custom)} icon="✨" />
        <StatCard label="Budget total" value={fmt(budgetTotal)} icon="💰" />
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
