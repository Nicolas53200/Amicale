import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleTabs } from "@/components/commission/module-tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";

const modelLabels: Record<string, string> = {
  simple: "Simple",
  evenement: "Événements",
  location: "Locations",
  voyage: "Voyages",
  bons: "Bons cadeaux",
};

export default async function CommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: commission, error } = await supabase
    .from("commissions")
    .select(
      "*, commission_members(id, role, members:member_id(id, first_name, last_name, avatar_url))"
    )
    .eq("id", id)
    .single();

  if (error || !commission) notFound();

  const budget = parseFloat(commission.budget || "0");
  const features = (commission.features as string[]) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl text-2xl",
              commission.color ? "" : "bg-brand-100 dark:bg-brand-500/20"
            )}
            style={
              commission.color
                ? { backgroundColor: `${commission.color}20`, color: commission.color }
                : undefined
            }
          >
            {commission.icon || "📋"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-content-primary">
                {commission.name}
              </h1>
              {commission.is_fixed && <Badge variant="neutral">Fixe</Badge>}
            </div>
            <p className="text-sm text-content-muted">
              {modelLabels[commission.model] || commission.model}
              {budget > 0 &&
                ` · Budget : ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget)}`}
            </p>
          </div>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/bureau/commissions">Retour</Link>
        </Button>
      </div>

      {commission.description && (
        <p className="text-sm text-content-secondary">
          {commission.description}
        </p>
      )}

      <ModuleTabs
        commissionId={commission.id}
        commissionName={commission.name}
        features={features}
        budget={budget}
      />
    </div>
  );
}
