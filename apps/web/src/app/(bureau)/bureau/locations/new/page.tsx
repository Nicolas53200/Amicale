import { GradientHeader } from "@/components/layout/gradient-header";
import { AssetForm } from "@/components/assets/asset-form";

export default function NouveauBienPage() {
  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouveau bien"
        subtitle="Ajoutez un bien locatif à votre amicale"
        backHref="/bureau/locations"
      />
      <AssetForm />
    </div>
  );
}
