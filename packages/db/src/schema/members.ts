import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export type MemberRole =
  | "president"
  | "tresorier"
  | "secretaire"
  | "commissaire"
  | "membre";

export type MemberStatus = "invite" | "onboarding" | "actif" | "inactif";

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    user_id: uuid("user_id"),
    first_name: varchar("first_name", { length: 100 }).notNull(),
    last_name: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    role: varchar("role", { length: 50 })
      .notNull()
      .default("membre")
      .$type<MemberRole>(),
    status: varchar("status", { length: 50 })
      .notNull()
      .default("invite")
      .$type<MemberStatus>(),
    invitation_code: varchar("invitation_code", { length: 50 }).unique(),
    avatar_url: text("avatar_url"),
    date_naissance: timestamp("date_naissance", { mode: "date" }),
    adresse: text("adresse"),
    grade: varchar("grade", { length: 100 }),
    centre: varchar("centre", { length: 100 }),
    bureau_role: varchar("bureau_role", { length: 100 }),
    is_bureau: boolean("is_bureau").notNull().default(false),
    situation_familiale: varchar("situation_familiale", { length: 50 }),
    nb_enfants: integer("nb_enfants"),
    contact_urgence: text("contact_urgence"),
    enfants_noms: jsonb("enfants_noms").$type<string[]>().default([]),
    enfants_naiss: jsonb("enfants_naiss").$type<string[]>().default([]),
    type_sp: varchar("type_sp", { length: 50 }),
    date_adhesion: timestamp("date_adhesion", { mode: "date" }),
    genre: varchar("genre", { length: 20 }),
    conjoint: varchar("conjoint", { length: 200 }),
    avatar_emoji: varchar("avatar_emoji", { length: 10 }),
    invitation_statut: varchar("invitation_statut", { length: 50 }),
    last_seen_changelog: timestamp("last_seen_changelog", { withTimezone: true }),
    onboarding_completed: boolean("onboarding_completed")
      .notNull()
      .default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("members_org_id_idx").on(table.org_id),
    index("members_user_id_idx").on(table.user_id),
    index("members_invitation_code_idx").on(table.invitation_code),
  ]
);
