-- 0017: Event constraints and integrity
-- Adds CHECK constraints on events.status and events.category,
-- plus an index for querying events by org + status.

-- CHECK on events.status
DO $$ BEGIN
  ALTER TABLE events
    ADD CONSTRAINT chk_event_status
    CHECK (status IN ('brouillon', 'programme', 'publie', 'annule', 'termine'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CHECK on events.category
DO $$ BEGIN
  ALTER TABLE events
    ADD CONSTRAINT chk_event_category
    CHECK (category IN (
      'repas', 'bal', 'tournoi', 'spectacle', 'loto',
      'marche', 'assemblée', 'formation', 'ceremonie',
      'sport', 'noel', 'fdf', 'sainte_barbe', 'autre'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for filtering events by org + status
CREATE INDEX IF NOT EXISTS events_org_status_idx ON events(org_id, status);
