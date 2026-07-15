import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { members } from "./members";

export type CommissionModel =
  | "simple"
  | "evenement"
  | "location"
  | "voyage"
  | "bons";

export const commissions = pgTable(
  "commissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    model: varchar("model", { length: 50 })
      .notNull()
      .default("simple")
      .$type<CommissionModel>(),
    icon: varchar("icon", { length: 10 }),
    color: varchar("color", { length: 20 }),
    budget: numeric("budget", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    features: jsonb("features")
      .notNull()
      .default(["notifications", "documents", "compta", "membres"]),
    is_fixed: boolean("is_fixed").notNull().default(false),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("commissions_org_id_idx").on(table.org_id)]
);

export const commissionMembers = pgTable(
  "commission_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull().default("membre"),
    joined_at: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("commission_members_commission_idx").on(table.commission_id),
    index("commission_members_member_idx").on(table.member_id),
  ]
);
