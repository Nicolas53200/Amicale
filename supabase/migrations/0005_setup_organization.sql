-- Migration 0005: Organization creation flow
-- RPC function for new presidents to create their amicale

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
    'president', 'onboarding', true, 'Président', false
  )
  RETURNING id INTO v_member_id;

  PERFORM public.create_default_commissions(v_org_id);

  RETURN jsonb_build_object(
    'org_id', v_org_id,
    'member_id', v_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.setup_organization TO authenticated;
REVOKE EXECUTE ON FUNCTION public.setup_organization FROM anon, public;
