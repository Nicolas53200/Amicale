import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  logo_url: text("logo_url"),
  settings: jsonb("settings")
    .notNull()
    .default({
      modules: {
        locations: true,
        voyages: true,
        evenements: true,
        bons_cadeaux: false,
      },
      onboarding_steps: 5,
      theme_color: "#FF6B35",
    }),
  active: boolean("active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
