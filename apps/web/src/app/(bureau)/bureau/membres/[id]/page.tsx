import { getMember } from "@/lib/actions/members";
import { GradientHeader } from "@/components/layout/gradient-header";
import { MemberDetail } from "@/components/members/member-detail";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title={`${member.first_name} ${member.last_name}`}
        subtitle={member.role === "membre" ? "Membre" : member.role}
        backHref="/bureau/membres"
      />
      <MemberDetail member={member} />
    </div>
  );
}
