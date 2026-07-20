import { GradientHeader } from "@/components/layout/gradient-header";
import { CommissionForm } from "@/components/commission/commission-form";

export default function NewCommissionPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouvelle commission"
        subtitle="Configurez les paramètres de votre commission"
        backHref="/bureau/commissions"
      />
      <CommissionForm />
    </div>
  );
}
