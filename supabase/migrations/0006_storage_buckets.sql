-- Migration 0006: Storage buckets + RLS policies
-- Public buckets for images, private bucket for documents

-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880,
    ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('assets', 'assets', true, 10485760,
    ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('events', 'events', true, 10485760,
    ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('documents', 'documents', false, 20971520, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Avatars — public read, authenticated write
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- 3. Assets — public read, authenticated write
CREATE POLICY "assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "assets_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'assets');

CREATE POLICY "assets_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'assets');

-- 4. Events — public read, authenticated write
CREATE POLICY "events_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

CREATE POLICY "events_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events');

CREATE POLICY "events_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'events');

CREATE POLICY "events_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events');

-- 5. Documents — org-scoped (private bucket)
-- Path pattern: {org_id}/{document_id}/{filename}
CREATE POLICY "documents_org_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.org_id()::text
  );

CREATE POLICY "documents_org_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.org_id()::text
  );

CREATE POLICY "documents_org_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.org_id()::text
  );

CREATE POLICY "documents_org_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.org_id()::text
  );
