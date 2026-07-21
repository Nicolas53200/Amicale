import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MemberCardProps {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  email?: string | null;
  avatarUrl?: string | null;
  isBureau: boolean;
  invitationCode?: string | null;
  grade?: string | null;
  typeSp?: string | null;
  dateAdhesion?: string | null;
  avatarEmoji?: string | null;
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
  retraite: "neutral",
};

const statusLabels: Record<string, string> = {
  actif: "Actif",
  retraite: "Retraité",
  onboarding: "Onboarding",
  invite: "Invité",
  inactif: "Inactif",
};

function adhesionYear(dateAdhesion: string | null | undefined): string | null {
  if (!dateAdhesion) return null;
  try {
    return new Date(dateAdhesion).getFullYear().toString();
  } catch {
    return null;
  }
}

export function MemberCard({
  id,
  firstName,
  lastName,
  role,
  status,
  avatarUrl,
  isBureau,
  grade,
  typeSp,
  dateAdhesion,
  avatarEmoji,
}: MemberCardProps) {
  const year = adhesionYear(dateAdhesion);

  return (
    <Link
      href={`/bureau/membres/${id}`}
      className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
    >
      {avatarEmoji ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xl">
          {avatarEmoji}
        </div>
      ) : (
        <Avatar name={`${firstName} ${lastName}`} src={avatarUrl} size="md" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-content-primary">
            {firstName} {lastName}
          </p>
          {isBureau && <Badge variant="default">Bureau</Badge>}
        </div>
        <p className="text-[11px] text-content-muted">
          {grade || roleLabels[role] || role}
          {typeSp && ` · ${typeSp}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <Badge variant={statusVariant[status] || "neutral"}>
          {statusLabels[status] || status}
        </Badge>
        {year && (
          <span className="text-[10px] text-content-muted">depuis {year}</span>
        )}
      </div>
    </Link>
  );
}
