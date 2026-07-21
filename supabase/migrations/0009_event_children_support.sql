-- Migration 0009: Add children/companion support to events and registrations

-- Ensure members have children detail columns (setup.sql has them, migrations didn't)
ALTER TABLE members ADD COLUMN IF NOT EXISTS enfants_noms JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS enfants_naiss JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add children/household config to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS children_allowed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS child_age_limit INTEGER DEFAULT 16;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_adults_per_household INTEGER DEFAULT 6;

-- Add detailed registration fields to event_registrations
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS nb_adultes INTEGER;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS nb_enfants INTEGER NOT NULL DEFAULT 0;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS enfants_idx JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS accompagnateur BOOLEAN NOT NULL DEFAULT false;
