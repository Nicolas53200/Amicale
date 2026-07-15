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
    destination: varchar("destination", { length: 255 }).notNull(),
    description: text("description"),
    image_url: text("image_url"),
    start_date: timestamp("start_date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }).notNull(),
    price_adult: numeric("price_adult", { precision: 10, scale: 2 }).notNull(),
    price_child: numeric("price_child", { precision: 10, scale: 2 }),
    max_seats: integer("max_seats"),
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
    payment_status: varchar("payment_status", { length: 50 })
      .notNull()
      .default("en_attente"),
    registered_at: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("trip_registrations_trip_idx").on(table.trip_id),
    index("trip_registrations_member_idx").on(table.member_id),
  ]
);
