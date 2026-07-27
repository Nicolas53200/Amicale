import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { members } from "./members";

export const cotisations = pgTable(
  "cotisations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("en_attente"),
    paid_at: timestamp("paid_at", { withTimezone: true }),
    method: varchar("method", { length: 50 }),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("cotisations_unique").on(table.org_id, table.member_id, table.year),
    index("cotisations_org_idx").on(table.org_id),
    index("cotisations_member_idx").on(table.member_id),
  ]
);
