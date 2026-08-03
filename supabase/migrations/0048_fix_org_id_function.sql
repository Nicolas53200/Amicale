-- Migration 0048: Fix org_id() to look up from members table
-- The original function reads org_id from the JWT, but nothing sets this claim.
-- This changes it to query the members table directly.
-- SECURITY DEFINER bypasses RLS on the members table (which itself uses org_id()),
-- breaking the circular dependency.

CREATE OR REPLACE FUNCTION public.org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Also update setup_organization to set org_id in the user's app_metadata
-- so the JWT will carry the claim after the next token refresh.
CREATE OR REPLACE FUNCTION public.setup_organization(
  p_org_name TEXT,
  p_org_slug TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_member_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.members WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Vous avez déjà un profil membre';
  END IF;

  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_org_slug) THEN
    RAISE EXCEPTION 'Ce nom d''amicale est déjà utilisé';
  END IF;

  INSERT INTO public.organizations (name, slug)
  VALUES (p_org_name, p_org_slug)
  RETURNING id INTO v_org_id;

  INSERT INTO public.members (
    org_id, user_id, first_name, last_name, email,
    role, status, is_bureau, bureau_role, onboarding_completed
  ) VALUES (
    v_org_id, v_user_id, p_first_name, p_last_name, p_email,
    'president', 'onboarding', true, 'president', false
  )
  RETURNING id INTO v_member_id;

  -- Set org_id in the user's app_metadata so the JWT carries it
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('org_id', v_org_id::text)
  WHERE id = v_user_id;

  PERFORM public.create_default_commissions(v_org_id);

  RETURN jsonb_build_object(
    'org_id', v_org_id,
    'member_id', v_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update bind_user_to_invitation to set org_id in app_metadata
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

  -- Set org_id in the user's app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('org_id', v_member.org_id::text)
  WHERE id = v_user_id;

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
