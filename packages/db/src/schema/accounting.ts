import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";
import { members } from "./members";

export type AccountingEntryType = "facture" | "recette" | "caution";
export type AccountingEntryStatus =
  | "attente"
  | "valide"
  | "rejete"
  | "recette";

export const accountingEntries = pgTable(
  "accounting_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 })
      .notNull()
      .$type<AccountingEntryType>(),
    label: varchar("label", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: varchar("status", { length: 50 })
      .notNull()
      .default("attente")
      .$type<AccountingEntryStatus>(),
    document_url: text("document_url"),
    payment_mode: varchar("payment_mode", { length: 50 }),
    payment_date: timestamp("payment_date", { mode: "date" }),
    submitted_by: uuid("submitted_by").references(() => members.id, {
      onDelete: "set null",
    }),
    validated_by: uuid("validated_by").references(() => members.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("accounting_entries_org_id_idx").on(table.org_id),
    index("accounting_entries_commission_id_idx").on(table.commission_id),
    index("accounting_entries_status_idx").on(table.status),
  ]
);
