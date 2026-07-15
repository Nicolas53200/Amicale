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
