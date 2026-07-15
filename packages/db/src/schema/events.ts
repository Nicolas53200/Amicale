import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";
import { members } from "./members";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id").references(() => commissions.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    end_date: timestamp("end_date", { withTimezone: true }),
    location: varchar("location", { length: 255 }),
    image_url: text("image_url"),
    max_attendees: integer("max_attendees"),
    price: numeric("price", { precision: 10, scale: 2 }).default("0"),
    max_benevoles: integer("max_benevoles"),
    category: varchar("category", { length: 100 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("events_org_id_idx").on(table.org_id),
    index("events_commission_id_idx").on(table.commission_id),
    index("events_date_idx").on(table.date),
  ]
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    event_id: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull().default("inscrit"),
    nb_personnes: integer("nb_personnes").notNull().default(1),
    is_benevole: varchar("is_benevole", { length: 50 }),
    registered_at: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("event_registrations_event_idx").on(table.event_id),
    index("event_registrations_member_idx").on(table.member_id),
  ]
);
