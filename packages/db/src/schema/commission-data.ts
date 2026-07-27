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
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";

export const commissionItems = pgTable(
  "commission_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    quantity: integer("quantity").notNull().default(0),
    threshold: integer("threshold"),
    unit_price: numeric("unit_price", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 50 }).notNull().default("actif"),
    icon: varchar("icon", { length: 10 }),
    metadata: jsonb("metadata").default({}),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("commission_items_org_idx").on(table.org_id),
    index("commission_items_commission_idx").on(table.commission_id),
  ]
);

export const commissionContacts = pgTable(
  "commission_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 500 }),
    description: text("description"),
    metadata: jsonb("metadata").default({}),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("commission_contacts_org_idx").on(table.org_id),
    index("commission_contacts_commission_idx").on(table.commission_id),
  ]
);

export const commissionActivities = pgTable(
  "commission_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }),
    end_date: timestamp("end_date", { withTimezone: true }),
    status: varchar("status", { length: 50 }).notNull().default("planifie"),
    amount: numeric("amount", { precision: 10, scale: 2 }),
    max_participants: integer("max_participants"),
    current_participants: integer("current_participants").notNull().default(0),
    location: varchar("location", { length: 255 }),
    beneficiary: varchar("beneficiary", { length: 255 }),
    metadata: jsonb("metadata").default({}),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("commission_activities_org_idx").on(table.org_id),
    index("commission_activities_commission_idx").on(table.commission_id),
  ]
);

export const commissionSettings = pgTable(
  "commission_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id")
      .notNull()
      .references(() => commissions.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 100 }).notNull(),
    value: jsonb("value").notNull(),
  },
  (table) => [
    unique("commission_settings_unique").on(table.commission_id, table.key),
    index("commission_settings_commission_idx").on(table.commission_id),
  ]
);
