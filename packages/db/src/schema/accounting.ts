import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  date,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";
import { members } from "./members";
import { events } from "./events";
import { trips, tripRegistrations, tripProviders } from "./trips";

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
    event_id: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
    trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
    trip_registration_id: uuid("trip_registration_id").references(() => tripRegistrations.id, { onDelete: "set null" }),
    trip_provider_id: uuid("trip_provider_id").references(() => tripProviders.id, { onDelete: "set null" }),
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
    source_document_type: varchar("source_document_type", { length: 30 }),
    payment_mode: varchar("payment_mode", { length: 50 }),
    payment_date: date("payment_date", { mode: "date" }),
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
    index("accounting_entries_event_id_idx").on(table.event_id),
    index("accounting_entries_trip_id_idx").on(table.trip_id),
    index("accounting_entries_trip_registration_id_idx").on(table.trip_registration_id),
    index("accounting_entries_trip_provider_id_idx").on(table.trip_provider_id),
    index("accounting_entries_status_idx").on(table.status),
  ]
);
