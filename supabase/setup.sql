-- ============================================================
-- SETUP COMPLET AMICALE — Copier-coller dans le SQL Editor
-- Contient : tables + fonctions + RLS + hook JWT + données
-- ============================================================


-- ============================================================
-- PARTIE 1 : TABLES
-- ============================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  logo_url TEXT,
  settings JSONB NOT NULL DEFAULT '{"modules":{"locations":true,"voyages":true,"evenements":true,"bons_cadeaux":false},"onboarding_steps":5,"theme_color":"#FF6B35"}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'membre',
  status VARCHAR(50) NOT NULL DEFAULT 'invite',
  invitation_code VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  date_naissance DATE,
  adresse TEXT,
  grade VARCHAR(100),
  centre VARCHAR(100),
  bureau_role VARCHAR(100),
  is_bureau BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  situation_familiale VARCHAR(50),
  nb_enfants INTEGER NOT NULL DEFAULT 0,
  contact_urgence TEXT,
  type_sp VARCHAR(10),
  date_adhesion DATE,
  genre VARCHAR(5),
  conjoint VARCHAR(255),
  enfants_noms JSONB NOT NULL DEFAULT '[]'::jsonb,
  enfants_naiss JSONB NOT NULL DEFAULT '[]'::jsonb,
  avatar_emoji VARCHAR(10),
  invitation_statut VARCHAR(20) NOT NULL DEFAULT 'non_invite',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX members_org_id_idx ON members(org_id);
CREATE INDEX members_user_id_idx ON members(user_id);
CREATE INDEX members_invitation_code_idx ON members(invitation_code);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(50) NOT NULL DEFAULT 'simple',
  icon VARCHAR(10),
  color VARCHAR(20),
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '["notifications","documents","compta","membres"]'::jsonb,
  is_fixed BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX commissions_org_id_idx ON commissions(org_id);

CREATE TABLE commission_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'membre',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(commission_id, member_id)
);

CREATE INDEX commission_members_commission_idx ON commission_members(commission_id);
CREATE INDEX commission_members_member_idx ON commission_members(member_id);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID REFERENCES commissions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location VARCHAR(255),
  image_url TEXT,
  max_attendees INTEGER,
  price NUMERIC(10,2) DEFAULT 0,
  max_benevoles INTEGER,
  category VARCHAR(100),
  icon VARCHAR(50),
  color VARCHAR(20),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_org_id_idx ON events(org_id);
CREATE INDEX events_commission_id_idx ON events(commission_id);
CREATE INDEX events_date_idx ON events(date);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'inscrit',
  nb_personnes INTEGER NOT NULL DEFAULT 1,
  is_benevole VARCHAR(50),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

CREATE INDEX event_registrations_event_idx ON event_registrations(event_id);
CREATE INDEX event_registrations_member_idx ON event_registrations(member_id);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID REFERENCES commissions(id) ON DELETE SET NULL,
  destination VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  price_adult NUMERIC(10,2) NOT NULL,
  price_child NUMERIC(10,2),
  max_seats INTEGER,
  included JSONB DEFAULT '[]'::jsonb,
  itinerary JSONB DEFAULT '[]'::jsonb,
  name VARCHAR(255),
  duration VARCHAR(100),
  transport VARCHAR(100),
  accommodation VARCHAR(255),
  icon VARCHAR(50),
  color VARCHAR(20),
  min_seats INTEGER,
  children_allowed BOOLEAN NOT NULL DEFAULT false,
  max_adults_per_household INTEGER,
  registration_deadline DATE,
  not_included JSONB NOT NULL DEFAULT '[]'::jsonb,
  child_age_limit INTEGER,
  guides_needed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX trips_org_id_idx ON trips(org_id);
CREATE INDEX trips_start_date_idx ON trips(start_date);

CREATE TABLE trip_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  nb_adults INTEGER NOT NULL DEFAULT 1,
  nb_children INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, member_id)
);

CREATE INDEX trip_registrations_trip_idx ON trip_registrations(trip_id);
CREATE INDEX trip_registrations_member_idx ON trip_registrations(member_id);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  daily_rate NUMERIC(10,2) NOT NULL,
  deposit NUMERIC(10,2) NOT NULL DEFAULT 0,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_index INTEGER,
  rules TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  capacity INTEGER,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'disponible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assets_org_id_idx ON assets(org_id);

CREATE TABLE asset_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  total_amount NUMERIC(10,2) NOT NULL,
  deposit_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX asset_bookings_asset_idx ON asset_bookings(asset_id);
CREATE INDEX asset_bookings_member_idx ON asset_bookings(member_id);
CREATE INDEX asset_bookings_dates_idx ON asset_bookings(start_date, end_date);

CREATE TABLE accounting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  provider VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'attente',
  document_url TEXT,
  payment_mode VARCHAR(50),
  payment_date DATE,
  submitted_by UUID REFERENCES members(id) ON DELETE SET NULL,
  validated_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX accounting_entries_org_id_idx ON accounting_entries(org_id);
CREATE INDEX accounting_entries_commission_id_idx ON accounting_entries(commission_id);
CREATE INDEX accounting_entries_status_idx ON accounting_entries(status);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID REFERENCES commissions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX documents_org_id_idx ON documents(org_id);
CREATE INDEX documents_commission_id_idx ON documents(commission_id);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID REFERENCES commissions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(50),
  read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_org_id_idx ON notifications(org_id);
CREATE INDEX notifications_target_member_idx ON notifications(target_member_id);
CREATE INDEX notifications_read_idx ON notifications(read);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX messages_org_id_idx ON messages(org_id);
CREATE INDEX messages_from_idx ON messages(from_id);
CREATE INDEX messages_to_idx ON messages(to_id);
CREATE INDEX messages_read_idx ON messages(read_at);


-- ============================================================
-- PARTIE 2 : FONCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.org_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'org_id')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_accounting_entries_updated_at BEFORE UPDATE ON accounting_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- PARTIE 3 : ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = public.org_id());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (id = public.org_id());

CREATE POLICY "members_select" ON members FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "members_update" ON members FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "members_delete" ON members FOR DELETE USING (org_id = public.org_id());
CREATE POLICY "members_anon_blocked" ON members FOR SELECT TO anon USING (false);
CREATE POLICY "members_self_select" ON members FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "commissions_insert" ON commissions FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "commissions_update" ON commissions FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "commissions_delete" ON commissions FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "commission_members_select" ON commission_members FOR SELECT USING (EXISTS (SELECT 1 FROM commissions WHERE commissions.id = commission_members.commission_id AND commissions.org_id = public.org_id()));
CREATE POLICY "commission_members_insert" ON commission_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM commissions WHERE commissions.id = commission_members.commission_id AND commissions.org_id = public.org_id()));
CREATE POLICY "commission_members_update" ON commission_members FOR UPDATE USING (EXISTS (SELECT 1 FROM commissions WHERE commissions.id = commission_members.commission_id AND commissions.org_id = public.org_id()));
CREATE POLICY "commission_members_delete" ON commission_members FOR DELETE USING (EXISTS (SELECT 1 FROM commissions WHERE commissions.id = commission_members.commission_id AND commissions.org_id = public.org_id()));

CREATE POLICY "events_select" ON events FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "events_update" ON events FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "events_delete" ON events FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "event_registrations_select" ON event_registrations FOR SELECT USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.org_id = public.org_id()));
CREATE POLICY "event_registrations_insert" ON event_registrations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.org_id = public.org_id()));
CREATE POLICY "event_registrations_update" ON event_registrations FOR UPDATE USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.org_id = public.org_id()));
CREATE POLICY "event_registrations_delete" ON event_registrations FOR DELETE USING (EXISTS (SELECT 1 FROM events WHERE events.id = event_registrations.event_id AND events.org_id = public.org_id()));

CREATE POLICY "trips_select" ON trips FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "trips_insert" ON trips FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "trips_update" ON trips FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "trips_delete" ON trips FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "trip_registrations_select" ON trip_registrations FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_registrations.trip_id AND trips.org_id = public.org_id()));
CREATE POLICY "trip_registrations_insert" ON trip_registrations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_registrations.trip_id AND trips.org_id = public.org_id()));
CREATE POLICY "trip_registrations_update" ON trip_registrations FOR UPDATE USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_registrations.trip_id AND trips.org_id = public.org_id()));
CREATE POLICY "trip_registrations_delete" ON trip_registrations FOR DELETE USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_registrations.trip_id AND trips.org_id = public.org_id()));

CREATE POLICY "assets_select" ON assets FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "assets_insert" ON assets FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "assets_update" ON assets FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "assets_delete" ON assets FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "asset_bookings_select" ON asset_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_bookings.asset_id AND assets.org_id = public.org_id()));
CREATE POLICY "asset_bookings_insert" ON asset_bookings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_bookings.asset_id AND assets.org_id = public.org_id()));
CREATE POLICY "asset_bookings_update" ON asset_bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_bookings.asset_id AND assets.org_id = public.org_id()));
CREATE POLICY "asset_bookings_delete" ON asset_bookings FOR DELETE USING (EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_bookings.asset_id AND assets.org_id = public.org_id()));

CREATE POLICY "accounting_entries_select" ON accounting_entries FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "accounting_entries_insert" ON accounting_entries FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "accounting_entries_update" ON accounting_entries FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "accounting_entries_delete" ON accounting_entries FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "documents_select" ON documents FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (org_id = public.org_id() AND (target_member_id IS NULL OR target_member_id IN (SELECT id FROM members WHERE user_id = auth.uid())));
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (org_id = public.org_id() AND target_member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "messages_select" ON messages FOR SELECT USING (org_id = public.org_id() AND (from_id IN (SELECT id FROM members WHERE user_id = auth.uid()) OR to_id IN (SELECT id FROM members WHERE user_id = auth.uid())));
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (org_id = public.org_id() AND from_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (org_id = public.org_id() AND to_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (org_id = public.org_id() AND from_id IN (SELECT id FROM members WHERE user_id = auth.uid()));


-- ============================================================
-- PARTIE 4 : HOOK JWT (injecte org_id, onboarding, role)
-- ============================================================

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

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.members TO supabase_auth_admin;


-- ============================================================
-- PARTIE 4b : FONCTIONS SECURITY DEFINER
-- ============================================================

-- Lookup invitation code safely (returns only non-PII fields)
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

-- Bind authenticated user to an invitation code (bypasses RLS)
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

-- Create default commissions for a new organization
CREATE OR REPLACE FUNCTION public.create_default_commissions(p_org_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO commissions (org_id, name, model, icon, color, budget, is_fixed, description) VALUES
    (p_org_id, 'Calendriers', 'simple', '📅', '#EF4444', 6000, true, 'Campagne de vente de calendriers'),
    (p_org_id, 'Événements', 'evenement', '🎉', '#FF6B35', 5000, true, 'Organisation des événements festifs et sportifs'),
    (p_org_id, 'Voyages', 'voyage', '✈️', '#3B82F6', 8000, true, 'Organisation des voyages et sorties'),
    (p_org_id, 'Locations', 'location', '🏠', '#10B981', 2000, true, 'Gestion des biens locatifs'),
    (p_org_id, 'Sport', 'simple', '⚽', '#8B5CF6', 1500, true, 'Activités sportives et tournois'),
    (p_org_id, 'Noël', 'simple', '🎄', '#1A6B3A', 3000, true, 'Organisation de l''arbre de Noël'),
    (p_org_id, 'Fête des Femmes', 'simple', '💐', '#E91E8C', 800, true, 'Bons cadeaux et prestataires pour la Fête des Femmes'),
    (p_org_id, 'Sainte-Barbe', 'simple', '🔥', '#DC2626', 4000, true, 'Organisation de la Sainte-Barbe'),
    (p_org_id, 'Solidarité', 'simple', '🤝', '#1D4ED8', 1000, true, 'Actions de solidarité entre membres'),
    (p_org_id, 'Foyer', 'simple', '☕', '#78716C', 500, true, 'Gestion du foyer et des consommations'),
    (p_org_id, 'JSP', 'simple', '🎓', '#3B82F6', 0, true, 'Jeunes Sapeurs-Pompiers'),
    (p_org_id, 'Anciens SP', 'simple', '🏅', '#8B5CF6', 0, true, 'Anciens Sapeurs-Pompiers et mémoire');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.create_default_commissions FROM anon, public, authenticated;

-- Setup a new organization with president + default commissions
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


-- ============================================================
-- PARTIE 5 : DONNEES DE DEMONSTRATION
-- ============================================================

INSERT INTO organizations (id, name, slug, plan, settings) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Amicale SP Laval',
  'amicale-sp-laval',
  'pro',
  '{"modules":{"locations":true,"voyages":true,"evenements":true,"bons_cadeaux":true},"onboarding_steps":5,"theme_color":"#FF6B35"}'::jsonb
);

INSERT INTO commissions (id, org_id, name, model, icon, color, budget, features, is_fixed, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Calendriers', 'simple', '📅', '#EF4444', 6000, '["notifications","documents","compta","membres"]', true, 'Campagne de vente de calendriers'),
  ('c0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Événements', 'evenement', '🎉', '#FF6B35', 5000, '["notifications","documents","compta","membres"]', true, 'Organisation des événements festifs et sportifs'),
  ('c0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Voyages', 'voyage', '✈️', '#3B82F6', 8000, '["notifications","documents","compta","membres"]', true, 'Organisation des voyages et sorties'),
  ('c0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Locations', 'location', '🏠', '#10B981', 2000, '["notifications","documents","compta","membres"]', true, 'Gestion des biens locatifs de l''amicale'),
  ('c0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Sport', 'simple', '⚽', '#8B5CF6', 1500, '["notifications","documents","compta","membres"]', true, 'Activités sportives et tournois'),
  ('c0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Noël', 'simple', '🎄', '#1A6B3A', 3000, '["notifications","documents","compta","membres"]', true, 'Organisation de l''arbre de Noël'),
  ('c0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Fête des Femmes', 'simple', '💐', '#E91E8C', 800, '["notifications","documents","compta","membres"]', true, 'Bons cadeaux et prestataires pour la Fête des Femmes'),
  ('c0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Sainte-Barbe', 'simple', '🔥', '#DC2626', 4000, '["notifications","documents","compta","membres"]', true, 'Organisation de la Sainte-Barbe'),
  ('c0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Solidarité', 'simple', '🤝', '#1D4ED8', 1000, '["notifications","documents","compta","membres"]', true, 'Actions de solidarité entre membres'),
  ('c0000010-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Foyer', 'simple', '☕', '#78716C', 500, '["notifications","documents","compta","membres"]', true, 'Gestion du foyer et des consommations'),
  ('c0000011-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'JSP', 'simple', '🎓', '#3B82F6', 0, '["notifications","documents","compta","membres"]', true, 'Jeunes Sapeurs-Pompiers'),
  ('c0000012-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'Anciens SP', 'simple', '🏅', '#8B5CF6', 0, '["notifications","documents","compta","membres"]', true, 'Anciens Sapeurs-Pompiers et mémoire');

INSERT INTO members (id, org_id, first_name, last_name, email, phone, role, status, grade, centre, is_bureau, bureau_role, onboarding_completed, invitation_code, date_naissance, adresse, type_sp, date_adhesion, genre, situation_familiale, conjoint, nb_enfants, enfants_noms, enfants_naiss, contact_urgence, avatar_emoji, invitation_statut) VALUES
  ('b0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Jean', 'Dupont', 'jean.dupont@email.fr', '06 12 34 56 78', 'president', 'actif', 'Sergent', 'CIS Laval', true, 'Président', true, 'INV-JEAN-4587', '1982-03-15', '12 rue des Lilas, 53000 Laval', 'SPV', '2016-01-01', 'H', 'marie_f', 'Claire Dupont', 2, '["Lucas","Emma"]'::jsonb, '["2013-04-18","2017-09-25"]'::jsonb, 'Claire Dupont — 06 98 76 54 32', '🚒', 'invite'),
  ('b0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sophie', 'Martin', 'sophie.martin@email.fr', '06 11 22 33 44', 'tresorier', 'actif', 'Caporal-chef', 'CIS Laval', true, 'Trésorière', true, 'INV-SOPHIE-1122', '1985-07-22', '4 rue Haute, 53000 Laval', 'SPV', '2014-03-15', 'F', 'marie_h', 'Paul Martin', 2, '["Hugo","Jade"]'::jsonb, '["2016-02-12","2019-11-30"]'::jsonb, '', '👩', 'invite'),
  ('b0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Pierre', 'Leroy', 'pierre.leroy@email.fr', '', 'secretaire', 'actif', 'Adjudant', 'CIS Changé', true, 'Secrétaire', true, 'INV-PIERRE-3344', '1978-11-08', '', 'SPP', '2010-06-01', 'H', 'pacse_f', 'Julie Roy', 1, '["Thomas"]'::jsonb, '["2009-05-20"]'::jsonb, '', '👨', 'non_invite'),
  ('b0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Marie', 'Garnier', 'marie.garnier@email.fr', '', 'commissaire', 'actif', 'Sapeur', 'CIS Laval', true, 'Commissaire aux comptes', true, 'INV-MARIE-5566', '1990-04-30', '', 'SPV', '2018-09-01', 'F', 'celibataire', '', 1, '["Léa"]'::jsonb, '["2022-08-08"]'::jsonb, '', '👩', 'non_invite'),
  ('b0000005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Michel', 'Durand', 'michel.durand@email.fr', '', 'membre', 'actif', 'Lieutenant', 'CIS Laval', false, NULL, true, 'INV-MICHEL-3301', '1965-01-12', '', 'SPP', '2005-01-01', 'H', '', '', 0, '[]'::jsonb, '[]'::jsonb, '', '👨', 'non_invite'),
  ('b0000006-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Robert', 'Chevalier', 'robert.chevalier@email.fr', '', 'membre', 'retraite', 'Adjudant-chef', 'CIS Laval', false, NULL, true, 'INV-ROBERT-3302', '1958-06-14', '', 'SPP', '1998-01-01', 'H', '', '', 0, '[]'::jsonb, '[]'::jsonb, '', '👨', 'non_invite'),
  ('b0000007-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Isabelle', 'Blanc', 'isabelle.blanc@email.fr', '', 'membre', 'retraite', 'Lieutenant', 'CIS Changé', false, NULL, true, 'INV-ISABELLE-3303', '1972-09-03', '', 'SPV', '2002-04-10', 'F', '', '', 0, '[]'::jsonb, '[]'::jsonb, '', '👩', 'non_invite'),
  ('b0000008-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Claude', 'Bernard', 'claude.bernard@email.fr', '', 'membre', 'retraite', 'Capitaine', 'CIS Laval', false, NULL, true, 'INV-CLAUDE-3304', '1950-02-27', '', 'SPP', '1985-01-01', 'H', '', '', 0, '[]'::jsonb, '[]'::jsonb, '', '👨', 'non_invite'),
  ('b0000009-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'François', 'Moreau', 'francois.moreau@email.fr', '06 45 67 89 01', 'membre', 'actif', 'Capitaine', 'CIS Laval', false, NULL, true, 'INV-FRANCOIS-7788', '1975-09-18', '8 avenue de la République, 53000 Laval', 'SPV', '2008-03-01', 'H', 'marie_f', 'Anne Moreau', 1, '["Théo"]'::jsonb, '["2010-06-15"]'::jsonb, 'Anne Moreau — 06 54 32 10 98', '👨', 'inscrit');

INSERT INTO commission_members (commission_id, member_id, role) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'responsable'),
  ('c0000001-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000005', 'membre'),
  ('c0000001-0000-0000-0000-000000000001', 'b0000006-0000-0000-0000-000000000006', 'membre'),
  ('c0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 'responsable'),
  ('c0000002-0000-0000-0000-000000000002', 'b0000007-0000-0000-0000-000000000007', 'membre'),
  ('c0000003-0000-0000-0000-000000000003', 'b0000003-0000-0000-0000-000000000003', 'responsable'),
  ('c0000003-0000-0000-0000-000000000003', 'b0000008-0000-0000-0000-000000000008', 'membre'),
  ('c0000004-0000-0000-0000-000000000004', 'b0000005-0000-0000-0000-000000000005', 'responsable'),
  ('c0000004-0000-0000-0000-000000000004', 'b0000007-0000-0000-0000-000000000007', 'membre'),
  ('c0000005-0000-0000-0000-000000000005', 'b0000006-0000-0000-0000-000000000006', 'responsable'),
  ('c0000005-0000-0000-0000-000000000005', 'b0000004-0000-0000-0000-000000000004', 'membre'),
  ('c0000007-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000001', 'responsable'),
  ('c0000007-0000-0000-0000-000000000007', 'b0000002-0000-0000-0000-000000000002', 'membre'),
  ('c0000007-0000-0000-0000-000000000007', 'b0000003-0000-0000-0000-000000000003', 'membre'),
  ('c0000008-0000-0000-0000-000000000008', 'b0000004-0000-0000-0000-000000000004', 'responsable'),
  ('c0000009-0000-0000-0000-000000000009', 'b0000008-0000-0000-0000-000000000008', 'responsable');

INSERT INTO events (id, org_id, commission_id, title, description, date, end_date, location, max_attendees, price, max_benevoles, category, icon, color, published) VALUES
  ('e0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'Repas annuel de l''amicale', 'Le traditionnel repas annuel de l''amicale réunit membres actifs, retraités et leurs familles.', '2026-06-14 12:00:00+02', NULL, 'Salle des fêtes, Argentré', NULL, NULL, 6, 'repas', 'ti-tools-kitchen-2', '#c0392b', true),
  ('e0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'Bal des pompiers', 'Soirée dansante ouverte à tous, buvette et restauration sur place.', '2026-06-27 21:00:00+02', NULL, 'Salle polyvalente', NULL, NULL, 6, 'bal', 'ti-music', '#9b6b00', true),
  ('e0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'Tournoi sportif inter-centres', 'Tournoi amical entre les centres de secours du département.', '2026-07-12 10:00:00+02', NULL, 'Stade municipal', NULL, NULL, 8, 'sport', 'ti-trophy', '#534AB7', false);

INSERT INTO event_registrations (event_id, member_id, status, nb_personnes, is_benevole) VALUES
  -- Repas: bénévoles Jean(Accueil), Sophie(Service table), Claude(Cuisine) + inscriptions
  ('e0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'inscrit', 1, 'Accueil'),
  ('e0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 'inscrit', 1, 'Service table'),
  ('e0000001-0000-0000-0000-000000000001', 'b0000008-0000-0000-0000-000000000008', 'inscrit', 1, 'Cuisine'),
  ('e0000001-0000-0000-0000-000000000001', 'b0000004-0000-0000-0000-000000000004', 'inscrit', 1, NULL),
  -- Bal: bénévoles Pierre(Sécurité), Marie(Buvette)
  ('e0000002-0000-0000-0000-000000000002', 'b0000003-0000-0000-0000-000000000003', 'inscrit', 1, 'Sécurité'),
  ('e0000002-0000-0000-0000-000000000002', 'b0000004-0000-0000-0000-000000000004', 'inscrit', 1, 'Buvette'),
  -- Tournoi: bénévole Jean(Arbitrage)
  ('e0000003-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'inscrit', 1, 'Arbitrage');

INSERT INTO trips (id, org_id, commission_id, destination, description, start_date, end_date, price_adult, price_child, max_seats, included, itinerary, name, duration, transport, accommodation, icon, color, min_seats, children_allowed, max_adults_per_household, registration_deadline, not_included, child_age_limit, guides_needed) VALUES
  ('d0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'Saint-Malo, Bretagne', 'Visite intra-muros, plage, dîner fruits de mer', '2026-09-05 07:00:00+02', '2026-09-06 20:00:00+02', 85, NULL, 42, '["Transport A/R en car","1 nuit hôtel 3★","Petit-déjeuner + dîner","Visite guidée intra-muros"]'::jsonb, '[]'::jsonb, 'Weekend à Saint-Malo', '2 jours / 1 nuit', 'Car privatisé', 'Hôtel 3★ · Demi-pension', 'ti-sailboat', '#1a5276', 20, false, 4, '2026-08-01', '["Déjeuner du samedi","Dépenses personnelles"]'::jsonb, NULL, NULL),
  ('d0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'Strasbourg, Alsace', 'Marchés de Noël, cathédrale, Petite France, croisière', '2026-12-05 06:00:00+01', '2026-12-07 22:00:00+01', 145, NULL, 38, '["TGV A/R 2nde classe","2 nuits hôtel centre-ville","Petits-déjeuners","Croisière sur l''Ill"]'::jsonb, '[]'::jsonb, 'Marché de Noël — Strasbourg', '3 jours / 2 nuits', 'TGV', 'Hôtel 3★ · Petit-déj inclus', 'ti-building-arch', '#1a6b3a', 20, false, 2, '2026-11-01', '["Repas midi et soir","Entrées musées","Dépenses personnelles"]'::jsonb, NULL, NULL),
  ('d0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'Centre de vacances, Vendée', 'Activités nautiques, randonnées, veillées', '2026-07-10 07:00:00+02', '2026-07-17 18:00:00+02', 120, 90, 30, '["Transport A/R","Pension complète 7 nuits","Activités encadrées","Assurance"]'::jsonb, '[]'::jsonb, 'Colonie d''été des enfants', '8 jours / 7 nuits', 'Car privatisé', 'Centre de vacances · Pension complète', 'ti-tent', '#1a7a1a', 15, true, 2, '2026-06-15', '["Argent de poche","Équipement personnel"]'::jsonb, 14, 4);

INSERT INTO trip_registrations (trip_id, member_id, nb_adults, nb_children, total_amount, payment_status) VALUES
  -- Sophie Martin → Saint-Malo (attente)
  ('d0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 1, 0, 85, 'en_attente'),
  -- Jean Dupont → Saint-Malo (acceptée)
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 1, 0, 85, 'paye'),
  -- Pierre Leroy → Strasbourg (acceptée)
  ('d0000002-0000-0000-0000-000000000002', 'b0000003-0000-0000-0000-000000000003', 1, 0, 145, 'paye');

INSERT INTO assets (id, org_id, name, type, description, daily_rate, deposit, rules, icon, color, capacity, tags, status) VALUES
  ('a0000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Appartement de l''amicale', 'appartement', '4 pièces · 2 chambres · cuisine équipée · 6 personnes max', 50, 300, 'Arrivée après 16h, départ avant 10h. Ménage à faire avant le départ.', 'ti-home', '#3478F6', 6, '["Wifi","Parking","Acompte 30%","Caution 300 €"]'::jsonb, 'disponible'),
  ('a0000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Barnum 10×5 m', 'barnum', 'Capacité 100 personnes · montage inclus', 0, 200, 'Montage inclus par la commission. Nettoyage avant restitution.', 'ti-tent', '#E8553A', 100, '["Caution 200 €","Montage inclus"]'::jsonb, 'loue'),
  ('a0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Remorque plateau 3,5T', 'remorque', 'Longueur 4 m · Permis B suffisant', 0, 150, 'Permis B obligatoire. Récupération au centre.', 'ti-crane', '#1E7A4A', NULL, '["Caution 150 €","Permis B"]'::jsonb, 'disponible'),
  ('a0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Camping partenaire 3★', 'camping', 'À 20 km de Laval · piscine · tarif négocié', 0, 0, 'Tarif −30% pour les membres de l''amicale.', 'ti-trees', '#0F6E56', NULL, '["3 étoiles","Piscine","Partenaire"]'::jsonb, 'disponible');

INSERT INTO asset_bookings (asset_id, member_id, start_date, end_date, status, total_amount, deposit_paid, notes) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '2026-08-01', '2026-08-08', 'confirmee', 455, 300, 'Vacances famille'),
  ('a0000001-0000-0000-0000-000000000001', 'b0000005-0000-0000-0000-000000000005', '2026-08-15', '2026-08-22', 'en_attente', 455, 0, 'Semaine 33'),
  ('a0000002-0000-0000-0000-000000000002', 'b0000006-0000-0000-0000-000000000006', '2026-07-19', '2026-07-20', 'confirmee', 100, 200, 'Anniversaire'),
  ('a0000004-0000-0000-0000-000000000004', 'b0000007-0000-0000-0000-000000000007', '2026-07-25', '2026-08-01', 'confirmee', 175, 100, 'Camping famille');

INSERT INTO accounting_entries (org_id, commission_id, type, label, amount, status, payment_mode) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'recette', 'Cotisations membres 2026', 2700, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'facture', 'Location salle repas annuel', 800, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'facture', 'Traiteur repas annuel', 1500, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'recette', 'Inscriptions voyage Saint-Malo', 1170, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'facture', 'Réservation hôtel Saint-Malo', 2400, 'valide', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 'facture', 'Location bus Saint-Malo', 950, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'recette', 'Location appartement été', 910, 'recette', 'virement'),
  ('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'facture', 'Entretien appartement', 350, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000008-0000-0000-0000-000000000008', 'facture', 'Acompte traiteur Ste-Barbe', 1200, 'valide', 'cheque'),
  ('11111111-1111-1111-1111-111111111111', 'c0000006-0000-0000-0000-000000000006', 'facture', 'Cadeaux enfants Noël', 450, 'attente', NULL),
  ('11111111-1111-1111-1111-111111111111', 'c0000005-0000-0000-0000-000000000005', 'recette', 'Subvention SDIS sport', 500, 'recette', 'virement');

INSERT INTO notifications (org_id, commission_id, target_member_id, title, message, read, sent_at) VALUES
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Bienvenue sur l''application !', 'L''amicale SP Laval lance sa nouvelle application. Retrouvez tous les événements, voyages et informations de votre amicale en un seul endroit.', false, now() - interval '7 days'),
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Inscriptions voyage Saint-Malo ouvertes', 'Les inscriptions pour le weekend à Saint-Malo (5-6 septembre) sont ouvertes ! Places limitées à 42 personnes, ne tardez pas.', false, now() - interval '3 days'),
  ('11111111-1111-1111-1111-111111111111', NULL, NULL, 'Tournoi sportif inter-centres le 12 juillet', 'Le tournoi inter-centres aura lieu le samedi 12 juillet au stade municipal.', false, now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', NULL, 'Repas annuel : recherche bénévoles', 'Nous cherchons encore des bénévoles pour le repas annuel du 14 juin. Contactez la commission événements.', false, now()),
  ('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001', 'Votre réservation est confirmée', 'Votre réservation de l''appartement de l''amicale est confirmée. Bon séjour !', false, now() - interval '5 days');

INSERT INTO messages (org_id, from_id, to_id, subject, body, read_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'b0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'Budget Sainte-Barbe', 'Salut Jean, j''ai finalisé le budget prévisionnel pour la Sainte-Barbe. On est à 3 800€ avec le traiteur et la déco. Tu valides ?', NULL),
  ('11111111-1111-1111-1111-111111111111', 'b0000003-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'Clés appartement', 'Bonjour, les clés de l''appartement sont disponibles au foyer. Tu peux passer les récupérer quand tu veux.', NULL),
  ('11111111-1111-1111-1111-111111111111', 'b0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 'RE: Budget Sainte-Barbe', 'C''est bon Sophie, le budget est validé. Tu peux lancer les commandes. Merci !', now()),
  ('11111111-1111-1111-1111-111111111111', 'b0000005-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000001', 'Inscription tournoi sportif', 'Salut ! Je suis dispo pour le tournoi inter-centres. Tu sais qui est motivé ?', NULL);

INSERT INTO documents (org_id, commission_id, title, content, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'PV Réunion bureau juin 2026', 'Compte-rendu de la réunion du bureau du 15 juin 2026. Points abordés : budget Sainte-Barbe, organisation repas annuel, point locations été.', 'b0000003-0000-0000-0000-000000000003'),
  ('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 'Programme voyage Saint-Malo', 'Programme détaillé du week-end à Saint-Malo. Jour 1 : remparts. Jour 2 : aquarium. Jour 3 : balade en mer.', 'b0000002-0000-0000-0000-000000000002'),
  ('11111111-1111-1111-1111-111111111111', 'c0000007-0000-0000-0000-000000000007', 'Devis traiteur Sainte-Barbe', 'Devis reçu du traiteur Le Gourmand : 35€/pers, menu 4 services, boissons incluses.', 'b0000002-0000-0000-0000-000000000002');


-- ============================================================
-- PARTIE 5b : CHANGELOGS (système "Nouveautés")
-- ============================================================

CREATE TABLE changelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  changes JSONB DEFAULT '[]',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_changelogs_published ON changelogs(published_at DESC);

ALTER TABLE members ADD COLUMN IF NOT EXISTS last_seen_changelog TIMESTAMPTZ;

ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "changelogs_select" ON changelogs FOR SELECT
  USING (org_id IS NULL OR org_id = public.org_id());
CREATE POLICY "changelogs_insert" ON changelogs FOR INSERT
  WITH CHECK (org_id = public.org_id());
CREATE POLICY "changelogs_update" ON changelogs FOR UPDATE
  USING (org_id = public.org_id());
CREATE POLICY "changelogs_delete" ON changelogs FOR DELETE
  USING (org_id = public.org_id());


-- ============================================================
-- PARTIE 6 : STORAGE BUCKETS + RLS
-- ============================================================

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

-- Avatars — public read, org-scoped write (path: {org_id}/...)
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "avatars_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "avatars_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Assets — public read, org-scoped write (path: {org_id}/...)
CREATE POLICY "assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "assets_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "assets_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "assets_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Events — public read, org-scoped write (path: {org_id}/...)
CREATE POLICY "events_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "events_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "events_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "events_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND (storage.foldername(name))[1] = public.org_id()::text);

-- Documents — org-scoped (private bucket)
CREATE POLICY "documents_org_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "documents_org_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "documents_org_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);
CREATE POLICY "documents_org_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = public.org_id()::text);
