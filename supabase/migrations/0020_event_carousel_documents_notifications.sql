-- 0020: Link documents to events and trips
-- Adds optional FK columns so documents can be associated with
-- a specific event or trip in addition to a commission.

DO $$ BEGIN
  ALTER TABLE documents ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE documents ADD COLUMN trip_id UUID REFERENCES trips(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Indexes for the new FK columns
CREATE INDEX IF NOT EXISTS documents_event_id_idx ON documents(event_id);
CREATE INDEX IF NOT EXISTS documents_trip_id_idx ON documents(trip_id);
