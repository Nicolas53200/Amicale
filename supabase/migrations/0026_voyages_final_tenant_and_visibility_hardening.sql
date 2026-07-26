-- 0026: RLS hardening for trip_messages and meeting_responses
-- These tables were created in 0011 without RLS policies.

-- trip_messages: enable RLS and add org-scoped policies via trip -> trips.org_id
ALTER TABLE trip_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "trip_messages_select" ON trip_messages
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = trip_messages.trip_id
          AND trips.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_messages_insert" ON trip_messages
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = trip_messages.trip_id
          AND trips.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_messages_update" ON trip_messages
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = trip_messages.trip_id
          AND trips.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_messages_delete" ON trip_messages
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = trip_messages.trip_id
          AND trips.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- meeting_responses: enable RLS and add org-scoped policies via message -> messages.org_id
ALTER TABLE meeting_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "meeting_responses_select" ON meeting_responses
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM messages
        WHERE messages.id = meeting_responses.message_id
          AND messages.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "meeting_responses_insert" ON meeting_responses
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM messages
        WHERE messages.id = meeting_responses.message_id
          AND messages.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "meeting_responses_update" ON meeting_responses
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM messages
        WHERE messages.id = meeting_responses.message_id
          AND messages.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "meeting_responses_delete" ON meeting_responses
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM messages
        WHERE messages.id = meeting_responses.message_id
          AND messages.org_id = public.org_id()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
