-- 0025: Waitlist position, sport commission reports
-- Adds waitlist_position to trip_registrations and creates
-- the sport_commission_reports table with RLS.

-- Add waitlist_position to trip_registrations
DO $$ BEGIN
  ALTER TABLE trip_registrations ADD COLUMN waitlist_position INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Sport commission reports
CREATE TABLE IF NOT EXISTS sport_commission_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  report_year INTEGER NOT NULL,
  nb_activities INTEGER,
  content TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'brouillon',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE sport_commission_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies (org_id based)
DO $$ BEGIN
  CREATE POLICY "sport_commission_reports_select"
    ON sport_commission_reports FOR SELECT
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "sport_commission_reports_insert"
    ON sport_commission_reports FOR INSERT
    WITH CHECK (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "sport_commission_reports_update"
    ON sport_commission_reports FOR UPDATE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "sport_commission_reports_delete"
    ON sport_commission_reports FOR DELETE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS sport_commission_reports_org_id_idx
  ON sport_commission_reports(org_id);

CREATE INDEX IF NOT EXISTS sport_commission_reports_commission_id_idx
  ON sport_commission_reports(commission_id);

CREATE INDEX IF NOT EXISTS sport_commission_reports_year_idx
  ON sport_commission_reports(report_year);
