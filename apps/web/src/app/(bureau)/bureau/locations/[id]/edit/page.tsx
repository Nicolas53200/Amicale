import { notFound } from "next/navigation";
import { getAsset } from "@/lib/actions/assets";
import { GradientHeader } from "@/components/layout/gradient-header";
import { AssetForm } from "@/components/assets/asset-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let asset;
  try {
    asset = await getAsset(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Modifier le bien"
        subtitle={asset.name}
        backHref={`/bureau/locations/${id}`}
      />
      <AssetForm asset={asset} />
    </div>
  );
}
