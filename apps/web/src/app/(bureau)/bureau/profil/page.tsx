import { redirect } from "next/navigation";
import { getProfile } from "@/lib/actions/profile";
import { GradientHeader } from "@/components/layout/gradient-header";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex flex-col gap-4">
      <GradientHeader
        title="Mon profil"
        subtitle="Gérez vos informations personnelles"
      />
      <ProfileForm profile={profile as Parameters<typeof ProfileForm>[0]["profile"]} />
    </div>
  );
}
