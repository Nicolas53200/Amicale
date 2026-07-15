import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MemberCardProps {
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  email?: string | null;
  avatarUrl?: string | null;
  isBureau: boolean;
  invitationCode?: string | null;
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

export function MemberCard({
  firstName,
  lastName,
  role,
  status,
  email,
  avatarUrl,
  isBureau,
  invitationCode,
}: MemberCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface-elevated p-4 shadow-sm">
      <Avatar name={`${firstName} ${lastName}`} src={avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-content-primary">
            {firstName} {lastName}
          </p>
          {isBureau && <Badge variant="default">Bureau</Badge>}
        </div>
        <p className="text-xs text-content-muted">
          {roleLabels[role] || role}
          {email && ` · ${email}`}
        </p>
      </div>
      <Badge variant={statusVariant[status] || "neutral"}>
        {status}
      </Badge>
    </div>
  );
}
