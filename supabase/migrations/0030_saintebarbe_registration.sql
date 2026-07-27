-- 0030: Sainte-Barbe registration function
-- Atomic inscription to Sainte-Barbe ceremonies via commission_activities.
-- Uses commission_activities with type='ceremony' to store registrations.
-- Registration data is stored in commission_activities.metadata.

-- Partial unique index to prevent duplicate Sainte-Barbe registrations
-- per member per ceremony activity.
-- metadata->>'member_id' identifies the registrant within a ceremony activity.
CREATE INDEX IF NOT EXISTS idx_commission_activities_saintebarbe_member
  ON commission_activities ((metadata->>'member_id'), (metadata->>'ceremony_id'))
  WHERE type = 'ceremony' AND metadata->>'registration_type' = 'saintebarbe';

-- Function: register_saintebarbe
-- Atomically registers a member for a Sainte-Barbe ceremony.
-- Parameters:
--   p_org_id          - organization UUID
--   p_commission_id   - Sainte-Barbe commission UUID
--   p_ceremony_id     - the ceremony activity UUID (parent commission_activity)
--   p_member_id       - registering member UUID
--   p_nb_adultes      - number of adults
--   p_nb_enfants      - number of children
--   p_metadata        - additional registration data (JSONB)
-- Returns: the newly created commission_activity UUID
CREATE OR REPLACE FUNCTION public.register_saintebarbe(
  p_org_id UUID,
  p_commission_id UUID,
  p_ceremony_id UUID,
  p_member_id UUID,
  p_nb_adultes INTEGER DEFAULT 1,
  p_nb_enfants INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_ceremony RECORD;
  v_current_count INTEGER;
  v_total_persons INTEGER;
  v_registration_id UUID;
BEGIN
  -- Lock the ceremony row to prevent concurrent over-booking
  SELECT id, max_participants, current_participants, date, metadata
  INTO v_ceremony
  FROM commission_activities
  WHERE id = p_ceremony_id
    AND org_id = p_org_id
    AND type = 'ceremony'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ceremony not found or does not belong to this organization';
  END IF;

  -- Validate ceremony date (must be in the future)
  IF v_ceremony.date IS NOT NULL AND v_ceremony.date < now() THEN
    RAISE EXCEPTION 'Cannot register: the ceremony date has passed';
  END IF;

  -- Validate date_limite (registration deadline)
  IF v_ceremony.metadata->>'date_limite' IS NOT NULL
     AND (v_ceremony.metadata->>'date_limite')::TIMESTAMPTZ < now() THEN
    RAISE EXCEPTION 'Cannot register: the registration deadline has passed';
  END IF;

  -- Prevent duplicate registration for the same member
  IF EXISTS (
    SELECT 1 FROM commission_activities
    WHERE org_id = p_org_id
      AND type = 'ceremony'
      AND metadata->>'registration_type' = 'saintebarbe'
      AND metadata->>'member_id' = p_member_id::TEXT
      AND metadata->>'ceremony_id' = p_ceremony_id::TEXT
  ) THEN
    RAISE EXCEPTION 'Member is already registered for this Sainte-Barbe ceremony';
  END IF;

  -- Calculate total persons for this registration
  v_total_persons := p_nb_adultes + p_nb_enfants;

  -- Check capacity
  v_current_count := COALESCE(v_ceremony.current_participants, 0);
  IF v_ceremony.max_participants IS NOT NULL
     AND (v_current_count + v_total_persons) > v_ceremony.max_participants THEN
    RAISE EXCEPTION 'Cannot register: capacity exceeded (% / % places)',
      v_current_count + v_total_persons, v_ceremony.max_participants;
  END IF;

  -- Create the registration as a commission_activity entry
  INSERT INTO commission_activities (
    org_id, commission_id, type, title, date, status, metadata
  ) VALUES (
    p_org_id,
    p_commission_id,
    'ceremony',
    'Inscription Sainte-Barbe',
    v_ceremony.date,
    'active',
    jsonb_build_object(
      'registration_type', 'saintebarbe',
      'ceremony_id', p_ceremony_id,
      'member_id', p_member_id,
      'nb_adultes', p_nb_adultes,
      'nb_enfants', p_nb_enfants,
      'total_persons', v_total_persons
    ) || p_metadata
  )
  RETURNING id INTO v_registration_id;

  -- Update the ceremony participant count atomically
  UPDATE commission_activities
  SET current_participants = v_current_count + v_total_persons,
      updated_at = now()
  WHERE id = p_ceremony_id;

  RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.register_saintebarbe TO authenticated;
REVOKE EXECUTE ON FUNCTION public.register_saintebarbe FROM anon, public;
