import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { events } from "./events";
import { members } from "./members";

export const photoAlbums = pgTable(
  "photo_albums",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    org_id: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    event_id: uuid("event_id").references(() => events.id, {
      onDelete: "set null",
    }),
    date: timestamp("date", { withTimezone: true }),
    cover_url: text("cover_url"),
    created_by: uuid("created_by").references(() => members.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("photo_albums_org_idx").on(table.org_id)]
);

export const albumPhotos = pgTable(
  "album_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    album_id: uuid("album_id")
      .notNull()
      .references(() => photoAlbums.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: text("caption"),
    uploaded_by: uuid("uploaded_by").references(() => members.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("album_photos_album_idx").on(table.album_id)]
);
