-- 0029: Noel commission support
-- Extends commission_items category CHECK to allow 'bon_noel'.
-- Extends commission_contacts type CHECK to allow 'magasin_noel'.
-- Adds partial unique index for bon_noel deduplication per child per year.

-- Drop and re-create the category CHECK on commission_items to include 'bon_noel'.
-- The original constraint is inline (from 0003), so we must find and drop it.
DO $$ BEGIN
  ALTER TABLE commission_items DROP CONSTRAINT IF EXISTS commission_items_category_check;
  ALTER TABLE commission_items
    ADD CONSTRAINT commission_items_category_check
    CHECK (category IN ('stock', 'voucher', 'equipment', 'subscription', 'material', 'game', 'bon_noel'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop and re-create the type CHECK on commission_contacts to include 'magasin_noel'.
DO $$ BEGIN
  ALTER TABLE commission_contacts DROP CONSTRAINT IF EXISTS commission_contacts_type_check;
  ALTER TABLE commission_contacts
    ADD CONSTRAINT commission_contacts_type_check
    CHECK (type IN ('prestataire', 'magasin', 'point_vente', 'magasin_noel'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Partial unique index: one bon_noel per child per year per commission.
-- Uses metadata->>'child_name' and metadata->>'year' for deduplication.
CREATE UNIQUE INDEX IF NOT EXISTS uq_bon_noel_child_year
  ON commission_items (commission_id, (metadata->>'child_name'), (metadata->>'year'))
  WHERE category = 'bon_noel';
