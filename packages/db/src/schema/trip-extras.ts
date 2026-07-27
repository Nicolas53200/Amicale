import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { trips } from "./trips";
import { members } from "./members";

export const tripMessages = pgTable(
  "trip_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trip_id: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    from_id: uuid("from_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    is_broadcast: boolean("is_broadcast").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("trip_messages_trip_idx").on(table.trip_id)]
);

export const tripAccompagnateurs = pgTable(
  "trip_accompagnateurs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trip_id: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("inscrit"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("trip_accompagnateurs_unique").on(table.trip_id, table.member_id),
    index("trip_accompagnateurs_trip_idx").on(table.trip_id),
  ]
);

export const meetingResponses = pgTable(
  "meeting_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    message_id: uuid("message_id").notNull(),
    member_id: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    response: varchar("response", { length: 50 }).notNull(),
    responded_at: timestamp("responded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("meeting_responses_unique").on(table.message_id, table.member_id),
  ]
);
