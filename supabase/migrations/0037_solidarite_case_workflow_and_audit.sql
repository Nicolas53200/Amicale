-- 0037: Solidarity case workflow and audit
-- Adds CHECK constraint on solidarity_cases.status if not already present.
-- Adds validation trigger: amount_granted <= amount_requested when status = 'valide'.

-- Create solidarity_cases table if it does not exist
-- (may have been created in a gap migration; IF NOT EXISTS ensures idempotency)
CREATE TABLE IF NOT EXISTS solidarity_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  amount_requested NUMERIC(10,2),
  amount_granted NUMERIC(10,2),
  decision_date DATE,
  decided_by UUID REFERENCES members(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
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

-- Indexes
CREATE INDEX IF NOT EXISTS solidarity_cases_org_id_idx
  ON solidarity_cases(org_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_commission_id_idx
  ON solidarity_cases(commission_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_member_id_idx
  ON solidarity_cases(member_id);

CREATE INDEX IF NOT EXISTS solidarity_cases_status_idx
  ON solidarity_cases(status);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_solidarity_cases_updated_at ON solidarity_cases;
CREATE TRIGGER trg_solidarity_cases_updated_at
  BEFORE UPDATE ON solidarity_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- CHECK constraint on solidarity_cases.status
DO $$ BEGIN
  ALTER TABLE solidarity_cases
    ADD CONSTRAINT chk_solidarity_cases_status
    CHECK (status IN ('en_attente', 'en_cours', 'valide', 'refuse', 'cloture'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
