"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              name={`${profile.first_name} ${profile.last_name}`}
              src={profile.avatar_url}
              size="lg"
            />
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                {profile.first_name} {profile.last_name}
              </h2>
              <div className="mt-1 flex gap-2">
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
            <p className="text-sm text-content-muted">
              {profile.organizations.name}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Email</label>
              <Input value={profile.email || ""} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Téléphone</label>
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                placeholder="06 00 00 00 00"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Adresse</label>
            <Input
              name="adresse"
              defaultValue={profile.adresse || ""}
              placeholder="Votre adresse"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-secondary">Date de naissance</label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations pompier</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Grade</label>
              <Input
                name="grade"
                defaultValue={profile.grade || ""}
                placeholder="Caporal, Sergent..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-content-secondary">Centre</label>
              <Input
                name="centre"
                defaultValue={profile.centre || ""}
                placeholder="CIS de..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm font-medium text-emerald-600">
            Profil mis à jour
          </span>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
