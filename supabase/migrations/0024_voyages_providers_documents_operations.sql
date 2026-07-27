-- 0024: Voyages — providers, documents, operational columns
-- Adds cancellation_policy and deposit_required to trips.
-- Adds CHECK constraints on trip_registrations.status, payment_status,
-- and trips.status values.

-- Add cancellation_policy to trips
DO $$ BEGIN
  ALTER TABLE trips ADD COLUMN cancellation_policy TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add deposit_required to trips
DO $$ BEGIN
  ALTER TABLE trips ADD COLUMN deposit_required NUMERIC(10,2);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- CHECK constraint on trip_registrations.status
DO $$ BEGIN
  ALTER TABLE trip_registrations
    ADD CONSTRAINT chk_trip_registration_status
    CHECK (status IN ('en_attente', 'confirmee', 'annulee', 'liste_attente', 'refusee'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CHECK constraint on trip_registrations.payment_status
DO $$ BEGIN
  ALTER TABLE trip_registrations
    ADD CONSTRAINT chk_trip_registration_payment_status
    CHECK (payment_status IN ('impaye', 'acompte', 'paye', 'rembourse'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CHECK constraint on trips.status
DO $$ BEGIN
  ALTER TABLE trips
    ADD CONSTRAINT chk_trip_status
    CHECK (status IN ('ouvert', 'complet', 'annule', 'termine', 'brouillon'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
