-- 0018: Voyages prototype parity
-- Adds publication_status to trips, creates trip_providers table
-- for managing providers/quotes/invoices per trip.

-- Add publication status to trips (mirrors events.status)
DO $$ BEGIN
  ALTER TABLE trips ADD COLUMN publication_status VARCHAR(30) DEFAULT 'brouillon';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE trips ADD COLUMN publication_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Trip providers: external companies (transport, hotel, activities, etc.)
CREATE TABLE IF NOT EXISTS trip_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provider_type VARCHAR(100),
  amount NUMERIC(10,2),
  quote_received BOOLEAN DEFAULT false,
  invoice_received BOOLEAN DEFAULT false,
  quote_url TEXT,
  invoice_url TEXT,
  contract_url TEXT,
  notes TEXT,
  due_date DATE,
  sent_to_accounting BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE trip_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies (org_id based, same pattern as trips)
DO $$ BEGIN
  CREATE POLICY "trip_providers_select" ON trip_providers
    FOR SELECT USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_providers_insert" ON trip_providers
    FOR INSERT WITH CHECK (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_providers_update" ON trip_providers
    FOR UPDATE USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "trip_providers_delete" ON trip_providers
    FOR DELETE USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS trip_providers_org_id_idx ON trip_providers(org_id);
CREATE INDEX IF NOT EXISTS trip_providers_trip_id_idx ON trip_providers(trip_id);

-- updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER trg_trip_providers_updated_at
    BEFORE UPDATE ON trip_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
