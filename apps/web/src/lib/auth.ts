import { createClient } from "@/lib/supabase/server";

export type BureauRole =
  | "president"
  | "vice_president"
  | "secretaire"
  | "tresorier"
  | "responsable_communication"
  | "responsable_commission"
  | "membre_commission"
  | "lecture";

export const BUREAU_ROLE_CONFIG: Record<
  BureauRole,
  {
    label: string;
    permissions: string[];
    commissions: "*" | never[];
  }
> = {
  president: {
    label: "President",
    permissions: ["*"],
    commissions: "*",
  },
  vice_president: {
    label: "Vice-President",
    permissions: ["*"],
    commissions: "*",
  },
  secretaire: {
    label: "Secretaire",
    permissions: [
      "membres",
      "messagerie",
      "reunions",
      "journal",
      "modeles",
      "archives",
      "gestion_commissions",
      "documents",
    ],
    commissions: "*",
  },
  tresorier: {
    label: "Tresorier / Comptable",
    permissions: [
      "messagerie",
      "reunions",
      "comptabilite",
      "documents",
      "archives",
      "calendriers",
      "evenements",
      "locations",
      "voyages",
    ],
    commissions: [],
  },
  responsable_communication: {
    label: "Responsable communication",
    permissions: [
      "messagerie",
      "reunions",
      "documents",
      "journal",
      "modeles",
      "archives",
      "evenements",
      "photos",
    ],
    commissions: [],
  },
  responsable_commission: {
    label: "Responsable commission",
    permissions: ["messagerie", "reunions", "documents"],
    commissions: [],
  },
  membre_commission: {
    label: "Membre de commission",
    permissions: ["messagerie", "reunions", "documents"],
    commissions: [],
  },
  lecture: {
    label: "Lecture seule",
    permissions: ["messagerie", "reunions"],
    commissions: [],
  },
};

export const BUREAU_TOOL_ACCESS: Record<string, string[]> = {
  president: [
    "membres",
    "messagerie",
    "compta",
    "reunions",
    "journal",
    "modeles",
    "gestion_commissions",
    "personnaliser",
  ],
  vice_president: [
    "membres",
    "messagerie",
    "compta",
    "reunions",
    "journal",
    "modeles",
    "gestion_commissions",
    "personnaliser",
  ],
  secretaire: [
    "membres",
    "messagerie",
    "reunions",
    "journal",
    "modeles",
    "gestion_commissions",
  ],
  tresorier: ["messagerie", "compta", "reunions", "modeles"],
  responsable_communication: [
    "messagerie",
    "reunions",
    "journal",
    "modeles",
    "photos",
  ],
  responsable_commission: ["messagerie", "reunions"],
  membre_commission: ["messagerie", "reunions"],
  lecture: ["messagerie", "reunions"],
};

export function getRoleConfig(role: string | null) {
  return (
    BUREAU_ROLE_CONFIG[(role as BureauRole) || "lecture"] ||
    BUREAU_ROLE_CONFIG.lecture
  );
}

export function getToolAccess(role: string | null): string[] {
  return BUREAU_TOOL_ACCESS[role || "lecture"] || BUREAU_TOOL_ACCESS.lecture;
}

export function hasPermission(
  role: string | null,
  permission: string
): boolean {
  const config = getRoleConfig(role);
  return (
    config.permissions.includes("*") ||
    config.permissions.includes(permission)
  );
}

export async function getOrgId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("No member profile");
  return member.org_id;
}

export async function getCurrentMember(): Promise<{
  orgId: string;
  memberId: string;
  isBureau: boolean;
  bureauRole: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("members")
    .select("id, org_id, is_bureau, bureau_role")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("No member profile");
  return {
    orgId: member.org_id,
    memberId: member.id,
    isBureau: !!member.is_bureau,
    bureauRole: member.bureau_role,
  };
}

export async function requireBureau(): Promise<{
  orgId: string;
  memberId: string;
  isBureau: true;
  bureauRole: string | null;
}> {
  const member = await getCurrentMember();
  if (!member.isBureau) {
    throw new Error("Acces reserve au bureau");
  }
  return {
    orgId: member.orgId,
    memberId: member.memberId,
    isBureau: true,
    bureauRole: member.bureauRole,
  };
}

export async function requirePermission(permission: string): Promise<{
  orgId: string;
  memberId: string;
  bureauRole: string | null;
}> {
  const member = await requireBureau();
  if (!hasPermission(member.bureauRole, permission)) {
    throw new Error(`Permission requise : ${permission}`);
  }
  return member;
}
