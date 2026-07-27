-- Migration 0045: Add documents storage bucket for commission documents
-- Org-scoped with RLS policies.

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Read: authenticated users within their org
CREATE POLICY "documents_auth_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Upload: authenticated users within their org
CREATE POLICY "documents_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Update: authenticated users within their org
CREATE POLICY "documents_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Delete: authenticated users within their org
CREATE POLICY "documents_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);
