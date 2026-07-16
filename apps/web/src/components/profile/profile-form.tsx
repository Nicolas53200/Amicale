"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile, updateMemberAvatarUrl } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${profile.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setUploadingAvatar(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        await updateMemberAvatarUrl(urlData.publicUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingAvatar(false);
    }
  }

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
      {/* Profile header with avatar upload */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative"
              disabled={uploadingAvatar}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-200 ring-offset-2 dark:ring-brand-500/30"
                />
              ) : (
                <Avatar
                  name={`${profile.first_name} ${profile.last_name}`}
                  size="lg"
                  className="h-16 w-16 ring-2 ring-brand-200 ring-offset-2 dark:ring-brand-500/30"
                />
              )}
              {/* Camera overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
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
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Telephone</label>
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

      {/* Family section */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-content-primary">
            Famille
          </h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            Prochainement
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Conjoint(e)</label>
            <Input
              disabled
              placeholder="Nom du conjoint"
              className="opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nombre d&apos;enfants</label>
            <Input
              type="number"
              disabled
              placeholder="0"
              className="opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-content-primary">
            Notifications
          </h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
            Prochainement
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <ToggleRow label="Notifications evenements" disabled />
          <ToggleRow label="Notifications voyages" disabled />
          <ToggleRow label="Notifications messagerie" disabled />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-[12px] font-medium text-emerald-600">
            Profil mis a jour
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

function ToggleRow({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-content-secondary">{label}</span>
      <label className="relative inline-flex cursor-not-allowed items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          disabled={disabled}
          defaultChecked
        />
        <div className="peer h-5 w-9 rounded-full bg-gray-300 opacity-50 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full dark:bg-gray-600 dark:peer-checked:bg-brand-500" />
      </label>
    </div>
  );
}
