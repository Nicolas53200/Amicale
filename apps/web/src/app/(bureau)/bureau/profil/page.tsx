import { redirect } from "next/navigation";
import { getProfile } from "@/lib/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content-primary">Mon profil</h1>
        <p className="text-sm text-content-secondary">
          Gérez vos informations personnelles
        </p>
      </div>
      <ProfileForm profile={profile as Parameters<typeof ProfileForm>[0]["profile"]} />
    </div>
  );
}
