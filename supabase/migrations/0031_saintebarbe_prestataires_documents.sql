-- 0031: Sainte-Barbe prestataires and document types
-- Extends commission_contacts type CHECK to allow 'prestataire_saintebarbe'.
-- Extends documents with a 'type' column supporting 'devis','facture','contrat'
-- for Sainte-Barbe documents. No new tables needed.

-- 1. Extend commission_contacts type CHECK
-- The original CHECK is inline in the CREATE TABLE (0003).
-- Drop the old constraint and create a new one with the additional value.
DO $$ BEGIN
  -- Try to drop the unnamed inline CHECK on commission_contacts.type
  -- PostgreSQL names inline CHECKs as <table>_<column>_check
  ALTER TABLE commission_contacts
    DROP CONSTRAINT IF EXISTS commission_contacts_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE commission_contacts
    ADD CONSTRAINT chk_commission_contacts_type
    CHECK (type IN ('prestataire', 'magasin', 'point_vente', 'prestataire_saintebarbe'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add a 'type' column to documents for document categorization
-- Supports: 'devis', 'facture', 'contrat', 'autre' (and NULL for legacy rows)
DO $$ BEGIN
  ALTER TABLE documents ADD COLUMN type VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add CHECK constraint on documents.type
DO $$ BEGIN
  ALTER TABLE documents
    ADD CONSTRAINT chk_documents_type
    CHECK (type IS NULL OR type IN ('devis', 'facture', 'contrat', 'compte_rendu', 'courrier', 'autre'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for filtering documents by type
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(type) WHERE type IS NOT NULL;
