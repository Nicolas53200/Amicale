"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  grade: string | null;
  centre: string | null;
  adresse: string | null;
  date_naissance: string | null;
  avatar_url: string | null;
  is_bureau: boolean;
  bureau_role: string | null;
  organizations: { name: string; slug: string; logo_url: string | null } | null;
}

const roleLabels: Record<string, string> = {
  president: "Président(e)",
  tresorier: "Trésorier(e)",
  secretaire: "Secrétaire",
  commissaire: "Commissaire",
  membre: "Membre",
};

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await updateProfile(new FormData(e.currentTarget));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Profile header */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${profile.first_name} ${profile.last_name}`}
            src={profile.avatar_url}
            size="lg"
          />
          <div>
            <h2 className="text-[17px] font-bold text-content-primary">
              {profile.first_name} {profile.last_name}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="default">{roleLabels[profile.role] || profile.role}</Badge>
              {profile.is_bureau && <Badge variant="neutral">Bureau</Badge>}
              <Badge
                variant={profile.status === "actif" ? "success" : "warning"}
              >
                {profile.status}
              </Badge>
            </div>
          </div>
        </div>
        {profile.organizations && (
          <p className="mt-3 text-[12px] text-content-muted">
            {profile.organizations.name}
          </p>
        )}
      </div>

      {/* Personal info */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations personnelles
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Email</label>
              <Input value={profile.email || ""} disabled />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Téléphone</label>
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="06 00 00 00 00"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Adresse</label>
            <Input
              name="adresse"
              defaultValue={profile.adresse || ""}
              placeholder="Votre adresse"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de naissance</label>
            <Input
              name="date_naissance"
              type="date"
              defaultValue={
                profile.date_naissance
                  ? new Date(profile.date_naissance).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>
        </div>
      </div>

      {/* Firefighter info */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations pompier
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Grade</label>
            <Input
              name="grade"
              defaultValue={profile.grade || ""}
              placeholder="Caporal, Sergent..."
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Centre</label>
            <Input
              name="centre"
              defaultValue={profile.centre || ""}
              placeholder="CIS de..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-[12px] font-medium text-emerald-600">
            Profil mis à jour
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-gradient ml-auto rounded-[14px] px-6 py-3 text-[13px] font-semibold text-white"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
