import { createClient } from "@/lib/supabase/server";
import { GradientHeader } from "@/components/layout/gradient-header";
import { MembresPageClient } from "@/components/members/membres-page-client";

export default async function MembresPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("last_name");

  const list = members ?? [];

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Membres"
        subtitle="Gerez les membres de votre amicale"
        backHref="/bureau/dashboard"
      />
      <MembresPageClient members={list} />
    </div>
  );
}
