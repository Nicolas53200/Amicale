-- 0041: Initialize anciens commission settings for budget tracking
-- Inserts default settings if they do not exist for:
--   'anciens_budget_previsionnel'  - annual budget plan
--   'anciens_cotisation_annuelle'  - annual membership fee config

-- Insert default anciens_budget_previsionnel for all orgs that have
-- an anciens-type commission but no setting yet.
-- Uses a CTE to find eligible commissions.
INSERT INTO commission_settings (org_id, commission_id, key, value)
SELECT
  c.org_id,
  c.id,
  'anciens_budget_previsionnel',
  jsonb_build_object(
    'year', EXTRACT(YEAR FROM now())::INTEGER,
    'total', 0,
    'categories', jsonb_build_object(
      'repas', 0,
      'sorties', 0,
      'cadeaux', 0,
      'divers', 0
    )
  )
FROM commissions c
WHERE LOWER(c.name) LIKE '%ancien%'
  AND c.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM commission_settings cs
    WHERE cs.commission_id = c.id
      AND cs.key = 'anciens_budget_previsionnel'
  )
ON CONFLICT (commission_id, key) DO NOTHING;

-- Insert default anciens_cotisation_annuelle for all orgs that have
-- an anciens-type commission but no setting yet.
INSERT INTO commission_settings (org_id, commission_id, key, value)
SELECT
  c.org_id,
  c.id,
  'anciens_cotisation_annuelle',
  jsonb_build_object(
    'amount', 0,
    'year', EXTRACT(YEAR FROM now())::INTEGER,
    'payment_methods', '["virement","cheque","especes"]'::jsonb,
    'deadline', NULL
  )
FROM commissions c
WHERE LOWER(c.name) LIKE '%ancien%'
  AND c.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM commission_settings cs
    WHERE cs.commission_id = c.id
      AND cs.key = 'anciens_cotisation_annuelle'
  )
ON CONFLICT (commission_id, key) DO NOTHING;
