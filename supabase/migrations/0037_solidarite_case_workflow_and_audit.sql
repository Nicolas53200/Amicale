-- 0037: Solidarity case workflow and audit
-- Adds CHECK constraint and validation trigger to solidarity_cases (created in 0028).
-- Does NOT re-create the table — 0028 is the canonical schema.

-- Enable RLS (idempotent)
ALTER TABLE solidarity_cases ENABLE ROW LEVEL SECURITY;

-- RLS policies (org_id based, idempotent)
DO $$ BEGIN
  CREATE POLICY "solidarity_cases_select"
    ON solidarity_cases FOR SELECT
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_insert"
    ON solidarity_cases FOR INSERT
    WITH CHECK (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_update"
    ON solidarity_cases FOR UPDATE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "solidarity_cases_delete"
    ON solidarity_cases FOR DELETE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes on columns that exist in the 0028 schema
CREATE INDEX IF NOT EXISTS solidarity_cases_org_id_idx
  ON solidarity_cases(org_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_commission_id_idx
  ON solidarity_cases(commission_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_status_idx
  ON solidarity_cases(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_solidarity_cases_updated_at ON solidarity_cases;
CREATE TRIGGER trg_solidarity_cases_updated_at
  BEFORE UPDATE ON solidarity_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Validation trigger: amount_granted must not exceed amount_requested
-- when status = 'valide'
CREATE OR REPLACE FUNCTION validate_solidarity_case_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'valide'
     AND NEW.amount_granted IS NOT NULL
     AND NEW.amount_requested IS NOT NULL
     AND NEW.amount_granted > NEW.amount_requested THEN
    RAISE EXCEPTION 'amount_granted (%) cannot exceed amount_requested (%) when status is valide',
      NEW.amount_granted, NEW.amount_requested;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_solidarity_case_amount ON solidarity_cases;

CREATE TRIGGER trg_validate_solidarity_case_amount
  BEFORE INSERT OR UPDATE ON solidarity_cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_solidarity_case_amount();
