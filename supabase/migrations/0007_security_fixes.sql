-- Migration 0007: Security fixes
-- - Drop leaky anon RLS policy, replace with SECURITY DEFINER RPC
-- - Add missing DELETE/UPDATE policies
-- - Add type column to notifications for reunions support

-- ============================================================
-- 1. Fix cross-tenant PII leak via members_invitation_lookup
-- ============================================================

-- Drop the leaky policy that exposed all PII to anon users
DROP POLICY IF EXISTS "members_invitation_lookup" ON members;

-- Block all direct table access for anon (the RPC bypasses RLS)
CREATE POLICY "members_anon_blocked" ON members
  FOR SELECT
  TO anon
  USING (false);

-- Create a SECURITY DEFINER function that returns only safe fields
CREATE OR REPLACE FUNCTION public.lookup_invitation(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'org_name', o.name,
    'first_name', m.first_name,
    'last_name', m.last_name
  )
  INTO v_result
  FROM public.members m
  JOIN public.organizations o ON o.id = m.org_id
  WHERE m.invitation_code = p_code
    AND m.status = 'invite'
    AND m.invitation_code IS NOT NULL
    AND m.user_id IS NULL;

  RETURN v_result; -- NULL if not found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.lookup_invitation TO anon, authenticated;


-- ============================================================
-- 2. Missing DELETE policies
-- ============================================================

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE
  USING (org_id = public.org_id());

CREATE POLICY "messages_delete" ON messages
  FOR DELETE
  USING (
    org_id = public.org_id()
    AND from_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );


-- ============================================================
-- 3. Missing UPDATE policies
-- ============================================================

CREATE POLICY "commission_members_update" ON commission_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM commissions
      WHERE commissions.id = commission_members.commission_id
        AND commissions.org_id = public.org_id()
    )
  );

CREATE POLICY "trip_registrations_update" ON trip_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_registrations.trip_id
        AND trips.org_id = public.org_id()
    )
  );


-- ============================================================
-- 4. Add type column to notifications for reunions support
-- ============================================================

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50);


-- ============================================================
-- 5. Fix storage: add org-scoping to public buckets
-- ============================================================
-- Path pattern: {org_id}/...
-- Previously these policies only checked bucket_id, allowing
-- any authenticated user to write to any org's storage paths.

-- Drop old un-scoped policies
DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "assets_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "assets_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "assets_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "events_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "events_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "events_auth_delete" ON storage.objects;

-- Recreate with org_id path check
-- Avatars
CREATE POLICY "avatars_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "avatars_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "avatars_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Assets
CREATE POLICY "assets_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "assets_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Events
CREATE POLICY "events_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "events_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);

CREATE POLICY "events_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);
