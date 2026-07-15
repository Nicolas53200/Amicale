import { CommissionForm } from "@/components/commission/commission-form";

export default function NewCommissionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary">
          Nouvelle commission
        </h1>
        <p className="text-sm text-content-secondary">
          Configurez les paramètres de votre commission
        </p>
      </div>
      <CommissionForm />
    </div>
  );
}
