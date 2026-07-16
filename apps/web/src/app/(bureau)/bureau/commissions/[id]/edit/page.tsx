import { notFound } from "next/navigation";
import { getCommission } from "@/lib/actions/commissions";
import { GradientHeader } from "@/components/layout/gradient-header";
import { CommissionForm } from "@/components/commission/commission-form";

export default async function EditCommissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let commission;
  try {
    commission = await getCommission(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Modifier la commission"
        subtitle={commission.name}
        backHref={`/bureau/commissions/${id}`}
      />
      <CommissionForm commission={commission} />
    </div>
  );
}
