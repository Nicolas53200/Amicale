-- Commission-specific data tables
-- Covers: stock, vouchers, equipment, subscriptions, prestataires, actions, calendar sectors

-- Commission items (stock, vouchers, equipment, subscriptions, materials, games)
CREATE TABLE commission_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('stock','voucher','equipment','subscription','material','game')),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  threshold INTEGER,
  unit_price NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  icon TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX commission_items_org_idx ON commission_items(org_id);
CREATE INDEX commission_items_commission_idx ON commission_items(commission_id);
CREATE INDEX commission_items_category_idx ON commission_items(category);

-- Commission contacts (prestataires, magasins, points de vente)
CREATE TABLE commission_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prestataire','magasin','point_vente')),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX commission_contacts_org_idx ON commission_contacts(org_id);
CREATE INDEX commission_contacts_commission_idx ON commission_contacts(commission_id);

-- Commission activities (solidarity actions, sport events, calendar sectors, calendar returns)
CREATE TABLE commission_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('action_solidaire','sport_event','inscription','calendar_sector','calendar_return','ceremony')),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  amount NUMERIC(10,2) DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  location TEXT,
  beneficiary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX commission_activities_org_idx ON commission_activities(org_id);
CREATE INDEX commission_activities_commission_idx ON commission_activities(commission_id);
CREATE INDEX commission_activities_type_idx ON commission_activities(type);

-- Commission settings (horaires, campaign config, etc.)
CREATE TABLE commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  UNIQUE(commission_id, key)
);

CREATE INDEX commission_settings_org_idx ON commission_settings(org_id);
CREATE INDEX commission_settings_commission_idx ON commission_settings(commission_id);

-- updated_at triggers
CREATE TRIGGER trg_commission_items_updated_at BEFORE UPDATE ON commission_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_commission_activities_updated_at BEFORE UPDATE ON commission_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE commission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies: scoped to org_id
CREATE POLICY "commission_items_select" ON commission_items FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "commission_items_insert" ON commission_items FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "commission_items_update" ON commission_items FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "commission_items_delete" ON commission_items FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "commission_contacts_select" ON commission_contacts FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "commission_contacts_insert" ON commission_contacts FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "commission_contacts_update" ON commission_contacts FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "commission_contacts_delete" ON commission_contacts FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "commission_activities_select" ON commission_activities FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "commission_activities_insert" ON commission_activities FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "commission_activities_update" ON commission_activities FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "commission_activities_delete" ON commission_activities FOR DELETE USING (org_id = public.org_id());

CREATE POLICY "commission_settings_select" ON commission_settings FOR SELECT USING (org_id = public.org_id());
CREATE POLICY "commission_settings_insert" ON commission_settings FOR INSERT WITH CHECK (org_id = public.org_id());
CREATE POLICY "commission_settings_update" ON commission_settings FOR UPDATE USING (org_id = public.org_id());
CREATE POLICY "commission_settings_delete" ON commission_settings FOR DELETE USING (org_id = public.org_id());
