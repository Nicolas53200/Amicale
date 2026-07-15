import { createClient } from "@/lib/supabase/server";
import { CommissionCard } from "@/components/commission/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function CommissionsAmicalistePage() {
  const supabase = await createClient();
  const { data: commissions } = await supabase
    .from("commissions")
    .select("*, commission_members(count)")
    .eq("active", true)
    .order("name");

  const list = commissions ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Commissions
        </h1>
        <p className="text-sm text-content-secondary">
          Découvrez les commissions de votre amicale
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucune commission"
          description="Les commissions de votre amicale apparaîtront ici"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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
              basePath="/amicaliste/commissions"
            />
          ))}
        </div>
      )}
    </div>
  );
}
