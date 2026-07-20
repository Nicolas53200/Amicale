-- Migration 0004: Fix onboarding flow & invitation system
-- Adds family columns, bind function, tighter RLS, JWT hook update

-- 1. Add family/onboarding columns to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS situation_familiale VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS nb_enfants INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS contact_urgence TEXT;

-- 2. Tighten anonymous invitation lookup (only invite-status members)
DROP POLICY IF EXISTS "members_invitation_lookup" ON members;
CREATE POLICY "members_invitation_lookup" ON members
  FOR SELECT
  TO anon
  USING (invitation_code IS NOT NULL AND status = 'invite');

-- 3. Allow authenticated users to SELECT their own member row by user_id
-- Safety net for the gap between signUp and JWT refresh
CREATE POLICY "members_self_select" ON members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Function: bind auth user to invitation code (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.bind_user_to_invitation(p_invitation_code TEXT)
RETURNS JSONB AS $$
DECLARE
  v_member RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.members WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already has a member profile';
  END IF;

  SELECT id, org_id, first_name, last_name
  INTO v_member
  FROM public.members
  WHERE invitation_code = p_invitation_code
    AND user_id IS NULL
    AND status = 'invite';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code d''invitation invalide ou déjà utilisé';
  END IF;

  UPDATE public.members
  SET user_id = v_user_id,
      status = 'onboarding',
      invitation_code = NULL
  WHERE id = v_member.id;

  RETURN jsonb_build_object(
    'member_id', v_member.id,
    'org_id', v_member.org_id,
    'first_name', v_member.first_name,
    'last_name', v_member.last_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.bind_user_to_invitation TO authenticated;
REVOKE EXECUTE ON FUNCTION public.bind_user_to_invitation FROM anon, public;

-- 5. Update JWT hook to include onboarding_completed, is_bureau, role
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  member_record RECORD;
BEGIN
  claims := event->'claims';

  SELECT m.org_id, m.onboarding_completed, m.is_bureau, m.role
  INTO member_record
  FROM public.members m
  WHERE m.user_id = (event->>'user_id')::UUID
  LIMIT 1;

  IF member_record.org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(member_record.org_id::TEXT));
    claims := jsonb_set(claims, '{onboarding_completed}', to_jsonb(member_record.onboarding_completed));
    claims := jsonb_set(claims, '{is_bureau}', to_jsonb(member_record.is_bureau));
    claims := jsonb_set(claims, '{member_role}', to_jsonb(member_record.role));
    event := jsonb_set(event, '{claims}', claims);
  END IF;

  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function: create default commissions for a new organization
CREATE OR REPLACE FUNCTION public.create_default_commissions(p_org_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO commissions (org_id, name, model, icon, color, budget, is_fixed, description) VALUES
    (p_org_id, 'Événements', 'evenement', '🎉', '#FF6B35', 5000, true, 'Organisation des événements festifs et sportifs'),
    (p_org_id, 'Voyages', 'voyage', '✈️', '#3B82F6', 8000, true, 'Organisation des voyages et sorties'),
    (p_org_id, 'Locations', 'location', '🏠', '#10B981', 2000, true, 'Gestion des biens locatifs'),
    (p_org_id, 'Sport', 'simple', '⚽', '#8B5CF6', 1500, true, 'Activités sportives et tournois'),
    (p_org_id, 'Noël', 'simple', '🎄', '#EF4444', 3000, true, 'Organisation des fêtes de Noël'),
    (p_org_id, 'Fête des familles', 'simple', '👨‍👩‍👧‍👦', '#F59E0B', 2000, true, 'Journée annuelle des familles'),
    (p_org_id, 'Sainte-Barbe', 'simple', '🔥', '#DC2626', 4000, true, 'Organisation de la Sainte-Barbe'),
    (p_org_id, 'Solidarité', 'simple', '🤝', '#06B6D4', 1000, true, 'Actions de solidarité entre membres'),
    (p_org_id, 'Foyer', 'simple', '☕', '#78716C', 500, true, 'Gestion du foyer et des consommations');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.create_default_commissions FROM anon, public, authenticated;
