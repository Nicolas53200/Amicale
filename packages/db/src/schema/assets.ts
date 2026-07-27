import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { members } from "./members";

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    description: text("description"),
    daily_rate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
    deposit: numeric("deposit", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    photos: jsonb("photos").notNull().default([]),
    cover_index: integer("cover_index"),
    rules: text("rules"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    capacity: integer("capacity"),
    tags: jsonb("tags").$type<string[]>().default([]),
    status: varchar("status", { length: 50 }).notNull().default("actif"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("assets_org_id_idx").on(table.org_id)]
);

export const assetBookings = pgTable(
  "asset_bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    asset_id: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    start_date: timestamp("start_date", { mode: "date" }).notNull(),
    end_date: timestamp("end_date", { mode: "date" }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("en_attente"),
    total_amount: numeric("total_amount", { precision: 10, scale: 2 })
      .notNull(),
    deposit_paid: numeric("deposit_paid", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    notes: text("notes"),
    refusal_reason: text("refusal_reason"),
    caution_received: boolean("caution_received").default(false),
    caution_received_at: timestamp("caution_received_at", { withTimezone: true }),
    caution_received_by: uuid("caution_received_by"),
    caution_amount: numeric("caution_amount", { precision: 10, scale: 2 }),
    caution_mode: varchar("caution_mode", { length: 50 }),
    caution_observations: text("caution_observations"),
    etat_lieux_entree: boolean("etat_lieux_entree").default(false),
    etat_lieux_entree_at: timestamp("etat_lieux_entree_at", { withTimezone: true }),
    etat_lieux_entree_by: uuid("etat_lieux_entree_by"),
    etat_lieux_entree_observations: text("etat_lieux_entree_observations"),
    cles_remises: boolean("cles_remises").default(false),
    cles_remises_at: timestamp("cles_remises_at", { withTimezone: true }),
    cles_remises_by: uuid("cles_remises_by"),
    etat_lieux_sortie: boolean("etat_lieux_sortie").default(false),
    etat_lieux_sortie_at: timestamp("etat_lieux_sortie_at", { withTimezone: true }),
    etat_lieux_sortie_by: uuid("etat_lieux_sortie_by"),
    etat_lieux_sortie_observations: text("etat_lieux_sortie_observations"),
    cles_retournees: boolean("cles_retournees").default(false),
    cles_retournees_at: timestamp("cles_retournees_at", { withTimezone: true }),
    cles_retournees_by: uuid("cles_retournees_by"),
    caution_returned: boolean("caution_returned").default(false),
    caution_returned_at: timestamp("caution_returned_at", { withTimezone: true }),
    caution_returned_by: uuid("caution_returned_by"),
    caution_retained_amount: numeric("caution_retained_amount", { precision: 10, scale: 2 }),
    caution_retained_reason: text("caution_retained_reason"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("asset_bookings_asset_idx").on(table.asset_id),
    index("asset_bookings_member_idx").on(table.member_id),
    index("asset_bookings_dates_idx").on(table.start_date, table.end_date),
  ]
);
