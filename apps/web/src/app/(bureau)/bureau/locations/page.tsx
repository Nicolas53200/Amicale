import { GradientHeader } from "@/components/layout/gradient-header";
import { getAssets } from "@/lib/actions/assets";
import { LocationTabs } from "@/components/assets/location-tabs";

export default async function LocationsPage() {
  const assets = await getAssets();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Commission Locations"
        subtitle="Gestion des biens"
        backHref="/bureau/dashboard"
      />

      <LocationTabs assets={assets} />
    </div>
  );
}
