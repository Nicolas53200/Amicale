-- Cotisations (membership fees) tracking
CREATE TABLE cotisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'paye', 'exonere')),
  paid_at TIMESTAMPTZ,
  method TEXT CHECK (method IN ('virement', 'cheque', 'especes', 'prelevement', 'autre')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, member_id, year)
);

ALTER TABLE cotisations ENABLE ROW LEVEL SECURITY;

-- Members can view their own cotisations
CREATE POLICY "Members can view own cotisations"
  ON cotisations FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Bureau can manage all cotisations in their org
CREATE POLICY "Bureau can manage cotisations"
  ON cotisations FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM members
      WHERE user_id = auth.uid()
      AND role IN ('bureau', 'admin')
    )
  );

-- Add cotisation settings to organizations.settings JSON
-- (cotisation_amount, cotisation_frequency already handled via org settings form)
