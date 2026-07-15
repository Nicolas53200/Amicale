"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  onboarding_completed: boolean;
  organizations: { name: string } | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("members")
        .select("id, first_name, last_name, onboarding_completed, organizations:org_id(name)")
        .eq("user_id", user.id)
        .single();

      if (!data) { router.push("/login"); return; }

      if (data.onboarding_completed) {
        router.push("/amicaliste/accueil");
        return;
      }

      setMember(data as unknown as MemberData);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading || !member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-content-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <OnboardingWizard
      memberId={member.id}
      firstName={member.first_name}
      lastName={member.last_name}
      orgName={member.organizations?.name ?? "votre amicale"}
    />
  );
}
