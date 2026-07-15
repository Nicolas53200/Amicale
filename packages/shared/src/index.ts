export type MemberRole =
  | "president"
  | "tresorier"
  | "secretaire"
  | "commissaire"
  | "membre";

export type MemberStatus = "invite" | "onboarding" | "actif" | "inactif";

export type CommissionModel =
  | "simple"
  | "evenement"
  | "location"
  | "voyage"
  | "bons";

export type AccountingEntryType = "facture" | "recette" | "caution";

export type AccountingEntryStatus =
  | "attente"
  | "valide"
  | "rejete"
  | "recette";

export type Plan = "free" | "pro" | "enterprise";

export interface OrganizationSettings {
  modules: {
    locations: boolean;
    voyages: boolean;
    evenements: boolean;
    bons_cadeaux: boolean;
  };
  onboarding_steps: number;
  theme_color: string;
}

export const COMMISSION_FEATURES = [
  "notifications",
  "documents",
  "compta",
  "membres",
] as const;

export type CommissionFeature = (typeof COMMISSION_FEATURES)[number];

export const ROLES_BUREAU: MemberRole[] = [
  "president",
  "tresorier",
  "secretaire",
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function generateInvitationCode(firstName: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${firstName.toUpperCase()}-${suffix}`;
}
