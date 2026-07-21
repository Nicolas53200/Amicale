"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  updateMember,
  deleteMember,
  updateMemberRole,
  updateMemberStatus,
} from "@/lib/actions/members";
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
  type_sp?: string | null;
  date_adhesion?: string | null;
  genre?: string | null;
  conjoint?: string | null;
  situation_familiale?: string | null;
  nb_enfants?: number;
  enfants_noms?: string[];
  enfants_naiss?: string[];
  contact_urgence?: string | null;
  avatar_emoji?: string | null;
  invitation_statut?: string | null;
}

interface Commission {
  commission_id: string;
  role: string;
  commissions: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

const roleLabels: Record<string, string> = {
  president: "President(e)",
  tresorier: "Tresorier(e)",
  secretaire: "Secretaire",
  commissaire: "Commissaire",
  membre: "Membre",
};

const statusLabels: Record<string, string> = {
  actif: "Actif",
  retraite: "Retraité",
  onboarding: "Onboarding",
  invite: "Invité",
  inactif: "Inactif",
  suspendu: "Suspendu",
};

const statusVariant: Record<
  string,
  "success" | "warning" | "neutral" | "default" | "danger"
> = {
  actif: "success",
  retraite: "neutral",
  onboarding: "default",
  invite: "warning",
  inactif: "neutral",
  suspendu: "danger",
};

const bureauRoles = [
  { value: "", label: "Aucun" },
  { value: "president", label: "President(e)" },
  { value: "vice_president", label: "Vice-president(e)" },
  { value: "tresorier", label: "Tresorier(e)" },
  { value: "tresorier_adjoint", label: "Tresorier(e) adjoint(e)" },
  { value: "secretaire", label: "Secretaire" },
  { value: "secretaire_adjoint", label: "Secretaire adjoint(e)" },
];

export function MemberDetail({
  member,
  commissions = [],
}: {
  member: Member;
  commissions?: Commission[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bureau role management
  const [isBureau, setIsBureau] = useState(member.is_bureau);
  const [bureauRole, setBureauRole] = useState(member.bureau_role ?? "");
  const [savingRole, setSavingRole] = useState(false);

  // Status management
  const [currentStatus, setCurrentStatus] = useState(member.status);
  const [savingStatus, setSavingStatus] = useState(false);

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

  async function handleBureauToggle() {
    setSavingRole(true);
    try {
      const newIsBureau = !isBureau;
      await updateMemberRole(member.id, {
        is_bureau: newIsBureau,
        bureau_role: newIsBureau ? bureauRole || null : null,
      });
      setIsBureau(newIsBureau);
      if (!newIsBureau) setBureauRole("");
      router.refresh();
    } catch {
      // revert
    } finally {
      setSavingRole(false);
    }
  }

  async function handleBureauRoleChange(newRole: string) {
    setSavingRole(true);
    setBureauRole(newRole);
    try {
      await updateMemberRole(member.id, {
        bureau_role: newRole || null,
      });
      router.refresh();
    } catch {
      setBureauRole(member.bureau_role ?? "");
    } finally {
      setSavingRole(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setSavingStatus(true);
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    try {
      await updateMemberStatus(member.id, newStatus);
      router.refresh();
    } catch {
      setCurrentStatus(previousStatus);
    } finally {
      setSavingStatus(false);
    }
  }

  const anciennete = useMemo(() => {
    if (!member.date_adhesion) return null;
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - new Date(member.date_adhesion).getTime()) / (1000 * 60 * 60 * 24 * 365.25)));
  }, [member.date_adhesion]);

  const situationLabels: Record<string, string> = {
    marie_f: "Marié(e)",
    marie_h: "Marié(e)",
    pacse_f: "Pacsé(e)",
    pacse_h: "Pacsé(e)",
    celibataire: "Célibataire",
    divorce: "Divorcé(e)",
    veuf: "Veuf(ve)",
  };

  const identityRows = [
    { label: "Grade", value: member.grade, icon: "🎖️" },
    { label: "Type", value: member.type_sp, icon: "🚒" },
    {
      label: "Ancienneté",
      value: anciennete !== null ? `${anciennete} an${anciennete > 1 ? "s" : ""}` : null,
      icon: "⏱️",
    },
    { label: "Centre", value: member.centre, icon: "🏢" },
    {
      label: "Date de naissance",
      value: member.date_naissance
        ? new Date(member.date_naissance).toLocaleDateString("fr-FR")
        : null,
      icon: "🎂",
    },
  ];

  const contactRows = [
    { label: "Email", value: member.email, icon: "📧" },
    { label: "Téléphone", value: member.phone, icon: "📱" },
    { label: "Adresse", value: member.adresse, icon: "📍" },
  ];

  const familyRows = [
    {
      label: "Situation",
      value: member.situation_familiale
        ? situationLabels[member.situation_familiale] || member.situation_familiale
        : null,
      icon: "💍",
    },
    { label: "Conjoint(e)", value: member.conjoint, icon: "👫" },
    {
      label: "Enfants",
      value: member.nb_enfants
        ? `${member.nb_enfants} enfant${member.nb_enfants > 1 ? "s" : ""}${
            member.enfants_noms?.length
              ? " : " + (member.enfants_noms as string[]).join(", ")
              : ""
          }`
        : null,
      icon: "👶",
    },
    { label: "Contact urgence", value: member.contact_urgence, icon: "🆘" },
  ];

  if (editing) {
    return (
      <form action={handleSave} className="flex flex-col gap-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-[16px] bg-surface-elevated p-4 shadow-sm">
          <Avatar
            name={`${member.first_name} ${member.last_name}`}
            src={member.avatar_url}
            size="lg"
          />
          <div>
            <p className="text-lg font-bold text-content-primary">
              {member.first_name} {member.last_name}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[member.status] || "neutral"}>
                {statusLabels[member.status] || member.status}
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
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Prenom
                </label>
                <Input
                  name="first_name"
                  defaultValue={member.first_name}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Nom
                </label>
                <Input
                  name="last_name"
                  defaultValue={member.last_name}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Email
              </label>
              <Input
                name="email"
                type="email"
                defaultValue={member.email ?? ""}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Telephone
              </label>
              <Input name="phone" defaultValue={member.phone ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Adresse
              </label>
              <Input name="adresse" defaultValue={member.adresse ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Date de naissance
              </label>
              <Input
                name="date_naissance"
                type="date"
                defaultValue={member.date_naissance ?? ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Grade
                </label>
                <Input name="grade" defaultValue={member.grade ?? ""} />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Centre
                </label>
                <Input name="centre" defaultValue={member.centre ?? ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Role
                </label>
                <Select name="role" defaultValue={member.role}>
                  <option value="membre">Membre</option>
                  <option value="commissaire">Commissaire</option>
                  <option value="secretaire">Secretaire</option>
                  <option value="tresorier">Tresorier(e)</option>
                  <option value="president">President(e)</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                  Statut
                </label>
                <Select name="status" defaultValue={member.status}>
                  <option value="invite">Invite</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
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
        {member.avatar_emoji ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-3xl">
            {member.avatar_emoji}
          </div>
        ) : (
          <Avatar
            name={`${member.first_name} ${member.last_name}`}
            src={member.avatar_url}
            size="lg"
          />
        )}
        <div className="flex-1">
          <p className="text-lg font-bold text-content-primary">
            {member.first_name} {member.last_name}
          </p>
          <p className="text-[13px] text-content-muted">
            {member.grade || roleLabels[member.role] || member.role}
            {member.type_sp && ` · ${member.type_sp}`}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={statusVariant[currentStatus] || "neutral"}>
              {statusLabels[currentStatus] || currentStatus}
            </Badge>
            {isBureau && <Badge variant="default">Bureau</Badge>}
            {member.bureau_role && (
              <Badge variant="neutral">
                {bureauRoles.find((r) => r.value === member.bureau_role)
                  ?.label || member.bureau_role}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {member.invitation_code && member.status === "invite" && (
        <div className="rounded-[16px] bg-amber-50 p-4 shadow-sm dark:bg-amber-500/10">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Lien d&apos;invitation
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="flex-1 truncate text-[13px] font-medium text-amber-800 dark:text-amber-300">
              {typeof window !== "undefined"
                ? `${window.location.origin}/invitation/${member.invitation_code}`
                : `/invitation/${member.invitation_code}`}
            </p>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/invitation/${member.invitation_code}`;
                navigator.clipboard.writeText(url);
              }}
              className="shrink-0 rounded-[8px] bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Copier
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-500">
            Code : <span className="font-mono font-bold">{member.invitation_code}</span>
          </p>
        </div>
      )}

      {/* Status management */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Statut du membre
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={savingStatus || currentStatus === value}
              onClick={() => handleStatusChange(value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50",
                currentStatus === value
                  ? "bg-brand-500 text-white"
                  : "bg-surface-secondary text-content-secondary hover:text-content-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {savingStatus && (
          <p className="mt-2 text-[11px] text-content-muted">
            Mise a jour...
          </p>
        )}
      </div>

      {/* Bureau role management */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Role au bureau
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-content-primary">
                Membre du bureau
              </p>
              <p className="text-[11px] text-content-muted">
                Donne acces aux fonctionnalites du bureau
              </p>
            </div>
            <button
              type="button"
              disabled={savingRole}
              onClick={handleBureauToggle}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50",
                isBureau ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  isBureau ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {isBureau && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-content-secondary">
                Fonction au bureau
              </label>
              <Select
                value={bureauRole}
                onChange={(e) => handleBureauRoleChange(e.target.value)}
                disabled={savingRole}
              >
                {bureauRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Commission membership */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Commissions
        </h3>
        {commissions.length === 0 ? (
          <p className="text-[13px] italic text-content-muted">
            Ce membre n&apos;appartient a aucune commission.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {commissions.map((cm) => {
              const commission = cm.commissions;
              if (!commission) return null;
              return (
                <Link
                  key={cm.commission_id}
                  href={`/bureau/commissions/${commission.id}`}
                  className="flex items-center gap-3 rounded-[12px] bg-surface-secondary p-3 transition-colors hover:bg-surface-primary"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{
                      backgroundColor: commission.color
                        ? `${commission.color}20`
                        : undefined,
                    }}
                  >
                    {commission.icon || "📋"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-content-primary">
                      {commission.name}
                    </p>
                    <p className="text-[11px] text-content-muted">
                      {cm.role === "responsable" ? "Responsable" : "Membre"}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-content-muted"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Identité
        </h3>
        <div className="flex flex-col gap-3">
          {identityRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <span className="text-sm">{row.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-content-muted">{row.label}</p>
                <p className={cn("text-[13px] font-medium", row.value ? "text-content-primary" : "text-content-muted italic")}>
                  {row.value || "Non renseigné"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Contact
        </h3>
        <div className="flex flex-col gap-3">
          {contactRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <span className="text-sm">{row.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-content-muted">{row.label}</p>
                <p className={cn("text-[13px] font-medium", row.value ? "text-content-primary" : "text-content-muted italic")}>
                  {row.value || "Non renseigné"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Situation familiale */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Situation familiale
        </h3>
        <div className="flex flex-col gap-3">
          {familyRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                <span className="text-sm">{row.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-content-muted">{row.label}</p>
                <p className={cn("text-[13px] font-medium", row.value ? "text-content-primary" : "text-content-muted italic")}>
                  {row.value || "Non renseigné"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-[16px] bg-surface-elevated p-4 shadow-sm">
        <h3 className="mb-3 text-[14px] font-bold text-content-primary">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3 text-[13px] font-medium text-content-primary transition-colors hover:bg-surface-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm dark:bg-brand-500/20">
                📧
              </span>
              Envoyer un email
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3 text-[13px] font-medium text-content-primary transition-colors hover:bg-surface-primary"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-500/20">
                📱
              </span>
              Appeler
            </a>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3 text-[13px] font-medium text-content-primary transition-colors hover:bg-surface-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm dark:bg-amber-500/20">
              ✏️
            </span>
            Modifier le profil
          </button>
          <Link
            href="/bureau/membres"
            className="flex items-center gap-2 rounded-[12px] bg-surface-secondary p-3 text-[13px] font-medium text-content-primary transition-colors hover:bg-surface-primary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm dark:bg-gray-500/20">
              👥
            </span>
            Voir tous
          </Link>
        </div>
      </div>

      {/* Primary actions */}
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
            Cette action est irreversible.
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
