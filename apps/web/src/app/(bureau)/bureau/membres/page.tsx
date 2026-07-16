import { createClient } from "@/lib/supabase/server";
import { GradientHeader } from "@/components/layout/gradient-header";
import { InviteForm } from "@/components/members/invite-form";
import { MemberList } from "@/components/members/member-list";

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
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Membres"
        subtitle="Gérez les membres de votre amicale"
        backHref="/bureau/dashboard"
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{total}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Actifs</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">{actifs}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Bureau</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-content-primary">{bureau}</p>
        </div>
        <div className="rounded-[14px] bg-surface-elevated p-3 shadow-sm">
          <p className="text-[10px] font-semibold uppercase text-content-muted">Invités</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-500">{invites}</p>
        </div>
      </div>

      <InviteForm />

      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Liste des membres
        </h3>
        <MemberList members={list} />
      </div>
    </div>
  );
}
