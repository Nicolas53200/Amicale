-- 0033: Sainte-Barbe registration update function
-- Allows updating an existing Sainte-Barbe inscription.
-- Recalculates capacity atomically, excluding the old family composition.
-- Validates date limits before allowing modification.

CREATE OR REPLACE FUNCTION public.update_saintebarbe_registration(
  p_org_id UUID,
  p_registration_id UUID,
  p_nb_adultes INTEGER DEFAULT NULL,
  p_nb_enfants INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_registration RECORD;
  v_ceremony RECORD;
  v_old_total INTEGER;
  v_new_total INTEGER;
  v_new_adultes INTEGER;
  v_new_enfants INTEGER;
  v_ceremony_id UUID;
BEGIN
  -- Lock and fetch the existing registration
  SELECT id, metadata, org_id
  INTO v_registration
  FROM commission_activities
  WHERE id = p_registration_id
    AND org_id = p_org_id
    AND type = 'ceremony'
    AND metadata->>'registration_type' = 'saintebarbe'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sainte-Barbe registration not found or does not belong to this organization';
  END IF;

  -- Extract ceremony_id from the registration metadata
  v_ceremony_id := (v_registration.metadata->>'ceremony_id')::UUID;

  -- Lock and fetch the ceremony
  SELECT id, max_participants, current_participants, date, metadata
  INTO v_ceremony
  FROM commission_activities
  WHERE id = v_ceremony_id
    AND org_id = p_org_id
    AND type = 'ceremony'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent ceremony not found';
  END IF;

  -- Validate ceremony date (must be in the future)
  IF v_ceremony.date IS NOT NULL AND v_ceremony.date < now() THEN
    RAISE EXCEPTION 'Cannot modify registration: the ceremony date has passed';
  END IF;

  -- Validate date_limite (registration deadline)
  IF v_ceremony.metadata->>'date_limite' IS NOT NULL
     AND (v_ceremony.metadata->>'date_limite')::TIMESTAMPTZ < now() THEN
    RAISE EXCEPTION 'Cannot modify registration: the registration deadline has passed';
  END IF;

  -- Calculate old total from current registration
  v_old_total := COALESCE((v_registration.metadata->>'total_persons')::INTEGER, 0);

  -- Determine new values (use provided or keep existing)
  v_new_adultes := COALESCE(p_nb_adultes, (v_registration.metadata->>'nb_adultes')::INTEGER, 1);
  v_new_enfants := COALESCE(p_nb_enfants, (v_registration.metadata->>'nb_enfants')::INTEGER, 0);
  v_new_total := v_new_adultes + v_new_enfants;

  -- Check capacity: subtract old total, add new total
  IF v_ceremony.max_participants IS NOT NULL
     AND (COALESCE(v_ceremony.current_participants, 0) - v_old_total + v_new_total) > v_ceremony.max_participants THEN
    RAISE EXCEPTION 'Cannot update registration: capacity exceeded (% / % places)',
      COALESCE(v_ceremony.current_participants, 0) - v_old_total + v_new_total,
      v_ceremony.max_participants;
  END IF;

  -- Update the registration metadata
  UPDATE commission_activities
  SET metadata = v_registration.metadata
    || jsonb_build_object(
      'nb_adultes', v_new_adultes,
      'nb_enfants', v_new_enfants,
      'total_persons', v_new_total
    )
    || COALESCE(p_metadata, '{}'::jsonb),
    updated_at = now()
  WHERE id = p_registration_id;

  -- Update the ceremony participant count atomically
  UPDATE commission_activities
  SET current_participants = COALESCE(current_participants, 0) - v_old_total + v_new_total,
      updated_at = now()
  WHERE id = v_ceremony_id;

  RETURN p_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.update_saintebarbe_registration TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_saintebarbe_registration FROM anon, public;
