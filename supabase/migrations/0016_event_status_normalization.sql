-- 0016: Event status normalization
-- Replaces the boolean "published" flag with a richer status workflow,
-- adds carousel control columns, volunteer posts, and photo/journal flags.

-- Add status column (replaces published boolean)
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN status VARCHAR(30) DEFAULT 'brouillon';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add publication timestamp
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN publication_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Carousel control columns
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN carousel_order INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN carousel_duration_seconds INTEGER DEFAULT 5;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN carousel_expires_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Structured volunteer posts (replaces flat max_benevoles)
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN volunteer_posts JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Photo / media flags
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN return_images_enabled BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN member_photo_upload_enabled BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN photo_validation_required BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN journal_images_enabled BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Composite index for listing events by org and date
CREATE INDEX IF NOT EXISTS events_org_date_idx ON events(org_id, date);

-- CHECK constraint on event_registrations.status
-- Use a DO block so re-running doesn't fail if the constraint already exists.
DO $$ BEGIN
  ALTER TABLE event_registrations
    ADD CONSTRAINT chk_event_registration_status
    CHECK (status IN ('inscrit', 'annule', 'liste_attente', 'confirme', 'refuse'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Backfill: migrate existing published boolean to the new status column
UPDATE events SET status = 'publie', publication_at = COALESCE(publication_at, updated_at)
  WHERE published = true AND (status IS NULL OR status = 'brouillon');

UPDATE events SET status = 'brouillon'
  WHERE published = false AND (status IS NULL OR status = 'brouillon');
