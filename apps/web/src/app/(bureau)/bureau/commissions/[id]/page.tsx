import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { GradientHeader } from "@/components/layout/gradient-header";
import { ModuleTabs } from "@/components/commission/module-tabs";
import { CommissionActions } from "@/components/commission/commission-actions";

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
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={`${commission.icon || "📋"} ${commission.name}`}
        subtitle={`${modelLabels[commission.model] || commission.model}${budget > 0 ? ` · Budget : ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget)}` : ""}`}
        backHref="/bureau/commissions"
      />

      {/* Info card */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={commission.is_fixed ? "neutral" : "default"}>
            {commission.is_fixed ? "Commission fixe" : "Commission personnalisée"}
          </Badge>
          <Badge variant="neutral">
            {modelLabels[commission.model] || commission.model}
          </Badge>
        </div>
        {commission.description && (
          <p className="mt-3 text-[13px] text-content-secondary">
            {commission.description}
          </p>
        )}
        <div className="mt-3 flex gap-3">
          <Link
            href={`/bureau/commissions/${id}/edit`}
            className="btn-gradient rounded-full px-4 py-2 text-[12px] font-semibold text-white"
          >
            Modifier
          </Link>
          <CommissionActions commissionId={id} />
        </div>
      </div>

      {/* Module tabs */}
      <ModuleTabs
        commissionId={commission.id}
        commissionName={commission.name}
        features={features}
        budget={budget}
      />
    </div>
  );
}
