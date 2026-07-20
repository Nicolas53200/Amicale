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
  id,
  firstName,
  lastName,
  role,
  status,
  email,
  avatarUrl,
  isBureau,
}: MemberCardProps) {
  return (
    <Link
      href={`/bureau/membres/${id}`}
      className="flex items-center gap-3 rounded-[14px] bg-surface-elevated p-3.5 shadow-sm transition-shadow active:shadow-none"
    >
      <Avatar name={`${firstName} ${lastName}`} src={avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-content-primary">
            {firstName} {lastName}
          </p>
          {isBureau && <Badge variant="default">Bureau</Badge>}
        </div>
        <p className="text-[11px] text-content-muted">
          {roleLabels[role] || role}
          {email && ` · ${email}`}
        </p>
      </div>
      <Badge variant={statusVariant[status] || "neutral"}>
        {status}
      </Badge>
    </Link>
  );
}
