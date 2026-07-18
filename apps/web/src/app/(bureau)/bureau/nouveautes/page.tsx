import { getChangelogs } from "@/lib/actions/changelogs";
import { GradientHeader } from "@/components/layout/gradient-header";
import { ChangelogList } from "./changelog-list";

export default async function NouveautesPage() {
  const changelogs = await getChangelogs();

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Nouveautés"
        subtitle="Gérez les notes de mise à jour"
      />
      <ChangelogList
        changelogs={changelogs as Parameters<typeof ChangelogList>[0]["changelogs"]}
      />
    </div>
  );
}
