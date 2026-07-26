import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
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
    carousel_order: integer("carousel_order").notNull().default(0),
    carousel_duration_seconds: integer("carousel_duration_seconds").notNull().default(5),
    carousel_expires_at: timestamp("carousel_expires_at", { withTimezone: true }),
    publication_at: timestamp("publication_at", { withTimezone: true }),
    volunteer_posts: jsonb("volunteer_posts").$type<{ name: string; capacity: number }[]>().notNull().default([]),
    return_images_enabled: boolean("return_images_enabled").notNull().default(false),
    member_photo_upload_enabled: boolean("member_photo_upload_enabled").notNull().default(false),
    photo_validation_required: boolean("photo_validation_required").notNull().default(false),
    journal_images_enabled: boolean("journal_images_enabled").notNull().default(false),
    max_attendees: integer("max_attendees"),
    price: numeric("price", { precision: 10, scale: 2 }).default("0"),
    max_benevoles: integer("max_benevoles"),
    category: varchar("category", { length: 100 }),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }),
    published: boolean("published").notNull().default(true),
    children_allowed: boolean("children_allowed").notNull().default(false),
    child_age_limit: integer("child_age_limit").default(16),
    max_adults_per_household: integer("max_adults_per_household").default(6),
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
    nb_adultes: integer("nb_adultes"),
    nb_enfants: integer("nb_enfants").notNull().default(0),
    enfants_idx: jsonb("enfants_idx").$type<number[]>().notNull().default([]),
    accompagnateur: boolean("accompagnateur").notNull().default(false),
    is_benevole: varchar("is_benevole", { length: 50 }),
    benevole_status: varchar("benevole_status", { length: 20 }),
    benevole_poste: varchar("benevole_poste", { length: 100 }),
    registered_at: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("event_registrations_event_idx").on(table.event_id),
    index("event_registrations_member_idx").on(table.member_id),
  ]
);
