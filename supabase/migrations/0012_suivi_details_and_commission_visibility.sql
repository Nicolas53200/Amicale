-- 0012: Detailed suivi fields for location bookings + commission visibility

-- Add detailed metadata for each suivi step
ALTER TABLE asset_bookings
  ADD COLUMN IF NOT EXISTS caution_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS caution_received_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS caution_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS caution_mode VARCHAR(50),
  ADD COLUMN IF NOT EXISTS caution_observations TEXT,
  ADD COLUMN IF NOT EXISTS etat_lieux_entree_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS etat_lieux_entree_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS etat_lieux_entree_observations TEXT,
  ADD COLUMN IF NOT EXISTS cles_remises_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cles_remises_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS etat_lieux_sortie_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS etat_lieux_sortie_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS etat_lieux_sortie_observations TEXT,
  ADD COLUMN IF NOT EXISTS cles_retournees_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cles_retournees_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS caution_returned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS caution_returned_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS caution_retained_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS caution_retained_reason TEXT;

-- Add soft-delete and visibility to commissions
ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES members(id);
