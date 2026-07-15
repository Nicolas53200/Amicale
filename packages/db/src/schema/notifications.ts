import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { commissions } from "./commissions";
import { members } from "./members";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    commission_id: uuid("commission_id").references(() => commissions.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    target_member_id: uuid("target_member_id").references(() => members.id, {
      onDelete: "cascade",
    }),
    read: boolean("read").notNull().default(false),
    sent_at: timestamp("sent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_org_id_idx").on(table.org_id),
    index("notifications_target_member_idx").on(table.target_member_id),
    index("notifications_read_idx").on(table.read),
  ]
);
