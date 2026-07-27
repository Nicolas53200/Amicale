-- Migration 0042: Commission dual visibility
-- Adds visible_bureau and visible_amicaliste columns to commissions table
-- for independent control of commission visibility per audience.

ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS visible_bureau BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS visible_amicaliste BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN commissions.visible_bureau IS 'Whether this commission is visible in the bureau dashboard';
COMMENT ON COLUMN commissions.visible_amicaliste IS 'Whether this commission is visible to amicaliste members';
