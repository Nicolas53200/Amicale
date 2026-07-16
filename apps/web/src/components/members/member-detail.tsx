"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateMember, deleteMember } from "@/lib/actions/members";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  status: string;
  avatar_url?: string | null;
  date_naissance?: string | null;
  adresse?: string | null;
  grade?: string | null;
  centre?: string | null;
  bureau_role?: string | null;
  is_bureau: boolean;
  invitation_code?: string | null;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  president: "Président(e)",
  tresorier: "Trésorier(ère)",
  secretaire: "Secrétaire",
  commissaire: "Commissaire",
  membre: "Membre",
};

const statusVariant: Record<string, "success" | "warning" | "neutral" | "default"> = {
  actif: "success",
  onboarding: "default",
  invite: "warning",
  inactif: "neutral",
};

export function MemberDetail({ member }: { member: Member }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    try {
      await updateMember(member.id, formData);
      setEditing(false);
      router.refresh();
    } catch {
      // handle error silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMember(member.id);
      router.push("/bureau/membres");
    } catch {
      setDeleting(false);
    }
  }

  const infoRows = [
    { label: "Email", value: member.email, icon: "📧" },
    { label: "Téléphone", value: member.phone, icon: "📱" },
    { label: "Adresse", value: member.adresse, icon: "📍" },
    {
      label: "Date de naissance",
      value: member.date_naissance
        ? new Date(member.date_naissance).toLocaleDateString("fr-FR")
        : null,
      icon: "🎂",
    },
    { label: "Grade", value: member.grade, icon: "🎖️" },
    { label: "Centre", value: member.centre, icon: "🏢" },
    {
      label: "Inscrit le",
      value: new Date(member.created_at).toLocaleDateString("fr-FR"),
      icon: "📅",
    },
  ];

  if (editing) {
    return (
      <form action={handleSave} className="flex flex-col gap-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <Avatar name={`${member.first_name} ${member.last_name}`} src={member.avatar_url} size="lg" />
          <div>
            <p className="text-lg font-bold text-content-primary">
              {member.first_name} {member.last_name}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[member.status] || "neutral"}>
                {member.status}
              </Badge>
              {member.is_bureau && <Badge variant="default">Bureau</Badge>}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <h3 className="mb-3 text-[14px] font-bold text-content-primary">
            Modifier les informations
          </h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Prénom</label>
                <Input name="first_name" defaultValue={member.first_name} required />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Nom</label>
                <Input name="last_name" defaultValue={member.last_name} required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Email</label>
              <Input name="email" type="email" defaultValue={member.email ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Téléphone</label>
              <Input name="phone" defaultValue={member.phone ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Adresse</label>
              <Input name="adresse" defaultValue={member.adresse ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">Date de naissance</label>
              <Input name="date_naissance" type="date" defaultValue={member.date_naissance ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Grade</label>
                <Input name="grade" defaultValue={member.grade ?? ""} />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Centre</label>
                <Input name="centre" defaultValue={member.centre ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Rôle</label>
                <Select name="role" defaultValue={member.role}>
                  <option value="membre">Membre</option>
                  <option value="commissaire">Commissaire</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="tresorier">Trésorier(ère)</option>
                  <option value="president">Président(e)</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">Statut</label>
                <Select name="status" defaultValue={member.status}>
                  <option value="invite">Invité</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-[14px] bg-surface-elevated px-4 py-3 text-[13px] font-semibold text-content-primary shadow-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header card */}
      <div className="flex items-center gap-4 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <Avatar name={`${member.first_name} ${member.last_name}`} src={member.avatar_url} size="lg" />
        <div className="flex-1">
          <p className="text-lg font-bold text-content-primary">
            {member.first_name} {member.last_name}
          </p>
          <p className="text-[13px] text-content-muted">
            {roleLabels[member.role] || member.role}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={statusVariant[member.status] || "neutral"}>
              {member.status}
            </Badge>
            {member.is_bureau && <Badge variant="default">Bureau</Badge>}
          </div>
        </div>
      </div>

      {member.invitation_code && member.status === "invite" && (
        <div className="rounded-[16px] bg-amber-50 p-4 shadow-sm dark:bg-amber-500/10">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Code d&apos;invitation
          </p>
          <p className="mt-1 text-lg font-bold tracking-widest text-amber-800 dark:text-amber-300">
            {member.invitation_code}
          </p>
        </div>
      )}

      {/* Info rows */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Informations
        </h3>
        <div className="flex flex-col gap-3">
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <span className="text-sm">{row.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-content-muted">{row.label}</p>
                <p className={cn(
                  "text-[13px] font-medium",
                  row.value ? "text-content-primary" : "text-content-muted italic"
                )}>
                  {row.value || "Non renseigné"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-gradient flex-1 rounded-[14px] px-4 py-3 text-[13px] font-semibold text-white"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400"
        >
          Supprimer
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="rounded-[16px] border-2 border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13px] font-semibold text-red-800 dark:text-red-300">
            Supprimer {member.first_name} {member.last_name} ?
          </p>
          <p className="mt-1 text-[12px] text-red-600 dark:text-red-400">
            Cette action est irréversible.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-[10px] bg-white px-3 py-2 text-[12px] font-semibold text-content-primary shadow-sm dark:bg-surface-elevated"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-[10px] bg-red-600 px-3 py-2 text-[12px] font-semibold text-white"
            >
              {deleting ? "Suppression..." : "Confirmer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
