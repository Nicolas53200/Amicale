-- Phase 1: Initial multi-tenant schema for Amicale SaaS
-- All tables carry org_id for tenant isolation via RLS

-- Organizations (1 org = 1 amicale)
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

-- Members
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX members_org_id_idx ON members(org_id);
CREATE INDEX members_user_id_idx ON members(user_id);
CREATE INDEX members_invitation_code_idx ON members(invitation_code);

-- Commissions
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

-- Commission members (many-to-many)
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

-- Events
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

-- Event registrations
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

-- Trips (voyages)
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

-- Trip registrations
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

-- Assets (biens locatifs)
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

-- Asset bookings (réservations)
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

-- Accounting entries (comptabilité)
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

-- Documents
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

-- Notifications
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

-- Messages
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

-- Helper function: get current user's org_id from JWT
CREATE OR REPLACE FUNCTION public.org_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'org_id')::UUID;
$$ LANGUAGE SQL STABLE;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_accounting_entries_updated_at BEFORE UPDATE ON accounting_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
