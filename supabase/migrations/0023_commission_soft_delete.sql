-- 0023: Commission soft-delete support
-- Adds deleted_at / deleted_by columns (idempotent — 0012 may have added them)
-- and updates the SELECT RLS policy to exclude soft-deleted commissions.

-- Add soft-delete columns (no-op if 0012 already ran)
DO $$ BEGIN
  ALTER TABLE commissions
    ADD COLUMN deleted_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE commissions
    ADD COLUMN deleted_by UUID REFERENCES members(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Replace the existing SELECT policy to filter out soft-deleted rows.
-- Drop old policy first, then create the new one.
DROP POLICY IF EXISTS "commissions_select" ON commissions;

CREATE POLICY "commissions_select" ON commissions
  FOR SELECT
  USING (org_id = public.org_id() AND deleted_at IS NULL);

-- Bureau/admin can still see soft-deleted commissions for recovery
DROP POLICY IF EXISTS "commissions_select_deleted" ON commissions;

CREATE POLICY "commissions_select_deleted" ON commissions
  FOR SELECT
  USING (
    org_id = public.org_id()
    AND deleted_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM members
      WHERE members.user_id = auth.uid()
        AND members.org_id = commissions.org_id
        AND members.role IN ('bureau', 'admin')
    )
  );
