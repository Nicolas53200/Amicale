import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { members } from "./members";

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    from_id: uuid("from_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    to_id: uuid("to_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 255 }),
    body: text("body").notNull(),
    read_at: timestamp("read_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_org_id_idx").on(table.org_id),
    index("messages_from_idx").on(table.from_id),
    index("messages_to_idx").on(table.to_id),
    index("messages_read_idx").on(table.read_at),
  ]
);
