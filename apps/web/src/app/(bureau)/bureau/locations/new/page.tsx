import { AssetForm } from "@/components/assets/asset-form";

export default function NouveauBienPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">
          Nouveau bien
        </h1>
        <p className="text-sm text-content-secondary">
          Ajoutez un nouveau bien locatif à votre amicale
        </p>
      </div>
      <AssetForm />
    </div>
  );
}
