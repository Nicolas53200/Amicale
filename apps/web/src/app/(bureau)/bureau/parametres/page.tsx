import { redirect } from "next/navigation";
import { getOrganization } from "@/lib/actions/organization";
import { GradientHeader } from "@/components/layout/gradient-header";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";

export default async function ParametresPage() {
  const org = await getOrganization();
  if (!org) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Paramètres"
        subtitle="Configurez votre amicale"
      />
      <OrgSettingsForm org={org as Parameters<typeof OrgSettingsForm>[0]["org"]} />
    </div>
  );
}
