import { redirect } from "next/navigation";
import { getOrganization } from "@/lib/actions/organization";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";

export default async function ParametresPage() {
  const org = await getOrganization();
  if (!org) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Paramètres</h1>
        <p className="text-sm text-content-secondary">
          Configurez votre amicale
        </p>
      </div>
      <OrgSettingsForm org={org as Parameters<typeof OrgSettingsForm>[0]["org"]} />
    </div>
  );
}
