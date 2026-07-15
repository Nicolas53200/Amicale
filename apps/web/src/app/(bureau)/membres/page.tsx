import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { MemberCard } from "@/components/members/member-card";
import { InviteForm } from "@/components/members/invite-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/ui/export-button";
import { exportMembers } from "@/lib/actions/export";
import Link from "next/link";

export default async function MembresPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("last_name");

  const list = members ?? [];
  const total = list.length;
  const actifs = list.filter((m) => m.status === "actif").length;
  const bureau = list.filter((m) => m.is_bureau).length;
  const invites = list.filter((m) => m.status === "invite").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Membres</h1>
          <p className="text-sm text-content-secondary">
            Gérez les membres de votre amicale
          </p>
        </div>
        <ExportButton
          label="Exporter CSV"
          filename="membres.csv"
          exportFn={exportMembers}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={String(total)} icon="👥" />
        <StatCard label="Actifs" value={String(actifs)} icon="✅" />
        <StatCard label="Bureau" value={String(bureau)} icon="🏛️" />
        <StatCard label="Invités" value={String(invites)} icon="📨" />
      </div>

      <InviteForm />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-content-primary">
          Liste des membres
        </h2>
        {list.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Aucun membre"
            description="Invitez votre premier membre pour commencer"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((m) => (
              <MemberCard
                key={m.id}
                firstName={m.first_name}
                lastName={m.last_name}
                role={m.role}
                status={m.status}
                email={m.email}
                avatarUrl={m.avatar_url}
                isBureau={m.is_bureau}
                invitationCode={m.invitation_code}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
