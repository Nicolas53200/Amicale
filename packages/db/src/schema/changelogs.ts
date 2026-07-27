import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const changelogs = pgTable("changelogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  org_id: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  changes: jsonb("changes").notNull().default([]),
  published_at: timestamp("published_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
