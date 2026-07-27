import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
  boolean,
  date,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";
import { members } from "./members";

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id").references(() => commissions.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }),
    destination: varchar("destination", { length: 255 }).notNull(),
    description: text("description"),
    image_url: text("image_url"),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }).notNull(),
    price_adult: numeric("price_adult", { precision: 10, scale: 2 }).notNull(),
    price_child: numeric("price_child", { precision: 10, scale: 2 }),
    max_seats: integer("max_seats"),
    min_seats: integer("min_seats"),
    transport: varchar("transport", { length: 100 }),
    accommodation: varchar("accommodation", { length: 255 }),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    children_allowed: boolean("children_allowed").notNull().default(false),
    max_adults_per_household: integer("max_adults_per_household"),
    registration_deadline: timestamp("registration_deadline", { withTimezone: true }),
    not_included: jsonb("not_included").default([]),
    child_age_limit: integer("child_age_limit"),
    guides_needed: integer("guides_needed"),
    status: varchar("status", { length: 50 }).notNull().default("ouvert"),
    publication_status: varchar("publication_status", { length: 30 }).notNull().default("brouillon"),
    publication_at: timestamp("publication_at", { withTimezone: true }),
    included: jsonb("included").default([]),
    itinerary: jsonb("itinerary").default([]),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trips_org_id_idx").on(table.org_id),
    index("trips_start_date_idx").on(table.start_date),
  ]
);

export const tripRegistrations = pgTable(
  "trip_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trip_id: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    nb_adults: integer("nb_adults").notNull().default(1),
    nb_children: integer("nb_children").notNull().default(0),
    total_amount: numeric("total_amount", { precision: 10, scale: 2 })
      .notNull(),
    status: varchar("status", { length: 50 }).notNull().default("en_attente"),
    payment_status: varchar("payment_status", { length: 50 })
      .notNull()
      .default("impaye"),
    paid_amount: numeric("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    payment_mode: varchar("payment_mode", { length: 50 }),
    payment_due_date: date("payment_due_date", { mode: "date" }),
    paid_at: timestamp("paid_at", { withTimezone: true }),
    registered_at: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trip_registrations_trip_idx").on(table.trip_id),
    index("trip_registrations_member_idx").on(table.member_id),
  ]
);

export const tripProviders = pgTable(
  "trip_providers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    trip_id: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    provider_type: varchar("provider_type", { length: 100 }),
    amount: numeric("amount", { precision: 12, scale: 2 }),
    quote_received: boolean("quote_received").notNull().default(false),
    invoice_received: boolean("invoice_received").notNull().default(false),
    quote_url: text("quote_url"),
    invoice_url: text("invoice_url"),
    contract_url: text("contract_url"),
    notes: text("notes"),
    due_date: date("due_date", { mode: "date" }),
    sent_to_accounting: boolean("sent_to_accounting").notNull().default(false),
    status: varchar("status", { length: 30 }).notNull().default("en_attente"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("trip_providers_org_idx").on(table.org_id),
    index("trip_providers_trip_idx").on(table.trip_id),
  ]
);
