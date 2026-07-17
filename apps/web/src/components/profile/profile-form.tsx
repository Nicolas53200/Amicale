"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile, updateMemberAvatarUrl } from "@/lib/actions/profile";
import { uploadFile, buildPath } from "@/lib/storage";
import { cn } from "@/lib/utils";

const avatarEmojis = [
  "\u{1F692}", "\u{1F9D1}‍\u{1F692}", "\u{1F525}", "⛑️", "\u{1F9BA}", "\u{1F4AA}", "\u{1F3CB}️", "⚡",
  "\u{1F415}", "\u{1F431}", "\u{1F3D4}️", "\u{1F30A}", "\u{1F3B8}", "⚽", "\u{1F3AF}", "\u{1F340}",
];

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
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
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

    setUploadingAvatar(true);
    try {
      const path = buildPath(profile.id, file);
      const publicUrl = await uploadFile("avatars", path, file);
      if (publicUrl) {
        await updateMemberAvatarUrl(publicUrl);
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
              ) : selectedEmoji ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 ring-2 ring-brand-200 ring-offset-2 dark:bg-brand-500/20 dark:ring-brand-500/30">
                  <span className="text-2xl">{selectedEmoji}</span>
                </div>
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

      {/* Emoji avatar picker */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Avatar emoji
        </h3>
        <p className="mb-3 text-[12px] text-content-muted">
          Choisissez un emoji pour personnaliser votre profil
        </p>
        <div className="grid grid-cols-8 gap-2">
          {avatarEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setAvatarPreview(null);
                setSelectedEmoji(emoji);
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[10px] text-lg transition-all",
                selectedEmoji === emoji
                  ? "bg-brand-100 ring-2 ring-brand-500 dark:bg-brand-500/20"
                  : "bg-surface-secondary hover:bg-surface-tertiary"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
        {selectedEmoji && (
          <input type="hidden" name="avatar_emoji" value={selectedEmoji} />
        )}
      </div>

      {/* Family section */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Famille
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Situation familiale</label>
              <select
                name="situation_familiale"
                defaultValue=""
                className="w-full rounded-[10px] border border-border-default bg-surface-secondary px-3 py-2.5 text-[13px] text-content-primary outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Non renseigne</option>
                <option value="celibataire">Celibataire</option>
                <option value="marie">Marie(e)</option>
                <option value="pacse">Pacse(e)</option>
                <option value="concubinage">Concubinage</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nombre d&apos;enfants</label>
              <Input
                name="nb_enfants"
                type="number"
                min="0"
                max="20"
                defaultValue=""
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Conjoint(e)</label>
            <Input
              name="conjoint"
              defaultValue=""
              placeholder="Prenom et nom du conjoint"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-content-secondary">Contact d&apos;urgence</label>
            <Input
              name="contact_urgence"
              defaultValue=""
              placeholder="Nom et telephone"
            />
          </div>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Notifications
        </h3>
        <div className="flex flex-col gap-3">
          <ToggleRow label="Notifications evenements" name="notif_events" />
          <ToggleRow label="Notifications voyages" name="notif_voyages" />
          <ToggleRow label="Notifications messagerie" name="notif_messages" />
        </div>
      </div>

      {/* Documents de l'amicale */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Documents de l&apos;amicale
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { icon: "📋", title: "Statuts de l'amicale", type: "PDF" },
            { icon: "📄", title: "Reglement interieur", type: "PDF" },
            { icon: "📊", title: "Bilan annuel", type: "PDF" },
          ].map((doc) => (
            <div
              key={doc.title}
              className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 dark:bg-brand-500/10">
                <span className="text-sm">{doc.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-content-primary">{doc.title}</p>
                <p className="text-[11px] text-content-muted">{doc.type}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-content-muted">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Vie de l'amicale */}
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-content-secondary">
          Vie de l&apos;amicale
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/amicaliste/journal"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20">
              <span className="text-lg">📰</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">Journal 2026</p>
              <p className="text-[11px] text-content-muted">Livre souvenir</p>
            </div>
          </a>
          <a
            href="/amicaliste/galerie"
            className="flex items-start gap-3 rounded-[16px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
              <span className="text-lg">📷</span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-content-primary">Retours en images</p>
              <p className="text-[11px] text-content-muted">Albums evenements</p>
            </div>
          </a>
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

function ToggleRow({ label, name }: { label: string; name?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-content-secondary">{label}</span>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          className="peer sr-only"
          defaultChecked
        />
        <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full dark:bg-gray-600 dark:peer-checked:bg-brand-500" />
      </label>
    </div>
  );
}
