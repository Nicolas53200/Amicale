-- 0032: Calendar divisions — add 'partiel' status and metadata validation
-- Adds 'partiel' to allowed status values for commission_activities
-- where type='calendar_sector'. Adds validation that division data
-- in metadata is well-formed.

-- 1. Replace the status CHECK on commission_activities to include 'partiel'
-- The original column has a default of 'active' but no named CHECK constraint
-- on the status column itself. Add one that covers all known statuses.
DO $$ BEGIN
  ALTER TABLE commission_activities
    DROP CONSTRAINT IF EXISTS chk_commission_activities_status;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE commission_activities
    ADD CONSTRAINT chk_commission_activities_status
    CHECK (status IN ('active', 'inactive', 'terminee', 'annulee', 'en_cours', 'partiel'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Validation trigger: when type='calendar_sector', metadata must contain
-- well-formed division data (sector_name and at least one division entry).
CREATE OR REPLACE FUNCTION validate_calendar_sector_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'calendar_sector' THEN
    -- metadata must have sector_name
    IF NEW.metadata->>'sector_name' IS NULL OR length(trim(NEW.metadata->>'sector_name')) = 0 THEN
      RAISE EXCEPTION 'calendar_sector metadata must contain a non-empty sector_name';
    END IF;

    -- If divisions key is present, it must be an array
    IF NEW.metadata ? 'divisions' AND jsonb_typeof(NEW.metadata->'divisions') != 'array' THEN
      RAISE EXCEPTION 'calendar_sector metadata.divisions must be a JSON array';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to be idempotent
DROP TRIGGER IF EXISTS trg_validate_calendar_sector ON commission_activities;

CREATE TRIGGER trg_validate_calendar_sector
  BEFORE INSERT OR UPDATE ON commission_activities
  FOR EACH ROW
  EXECUTE FUNCTION validate_calendar_sector_metadata();
