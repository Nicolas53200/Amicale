-- 0027: Foyer stock movements
-- Tracks stock entries, exits, and inventory counts for the foyer commission.

CREATE TABLE IF NOT EXISTS foyer_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
  movement_type VARCHAR(30) NOT NULL
    CHECK (movement_type IN ('entree', 'sortie', 'inventaire')),
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  invoice_amount NUMERIC(10,2),
  invoice_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  sent_to_accounting BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE foyer_stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS policies (org_id based)
DO $$ BEGIN
  CREATE POLICY "foyer_stock_movements_select"
    ON foyer_stock_movements FOR SELECT
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "foyer_stock_movements_insert"
    ON foyer_stock_movements FOR INSERT
    WITH CHECK (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "foyer_stock_movements_update"
    ON foyer_stock_movements FOR UPDATE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "foyer_stock_movements_delete"
    ON foyer_stock_movements FOR DELETE
    USING (org_id = public.org_id());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS foyer_stock_movements_org_id_idx
  ON foyer_stock_movements(org_id);

CREATE INDEX IF NOT EXISTS foyer_stock_movements_commission_id_idx
  ON foyer_stock_movements(commission_id);

CREATE INDEX IF NOT EXISTS foyer_stock_movements_movement_type_idx
  ON foyer_stock_movements(movement_type);

CREATE INDEX IF NOT EXISTS foyer_stock_movements_created_at_idx
  ON foyer_stock_movements(created_at);
