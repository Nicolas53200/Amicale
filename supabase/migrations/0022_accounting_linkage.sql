-- 0022: Link accounting entries to events, trips, trip_registrations, and trip_providers.
-- Adds source_document_type for categorization. Changes payment_date to DATE if needed.

-- Add event_id FK
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add trip_id FK
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ADD COLUMN trip_id UUID REFERENCES trips(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add trip_registration_id FK
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ADD COLUMN trip_registration_id UUID REFERENCES trip_registrations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add trip_provider_id FK
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ADD COLUMN trip_provider_id UUID REFERENCES trip_providers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add source_document_type
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ADD COLUMN source_document_type VARCHAR(30);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Change payment_date from TIMESTAMPTZ to DATE if it isn't already DATE.
-- The initial schema defines it as DATE, but this handles any drift.
DO $$ BEGIN
  ALTER TABLE accounting_entries
    ALTER COLUMN payment_date TYPE DATE USING payment_date::date;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Indexes on new FK columns
CREATE INDEX IF NOT EXISTS accounting_entries_event_id_idx
  ON accounting_entries(event_id);

CREATE INDEX IF NOT EXISTS accounting_entries_trip_id_idx
  ON accounting_entries(trip_id);

CREATE INDEX IF NOT EXISTS accounting_entries_trip_registration_id_idx
  ON accounting_entries(trip_registration_id);

CREATE INDEX IF NOT EXISTS accounting_entries_trip_provider_id_idx
  ON accounting_entries(trip_provider_id);
