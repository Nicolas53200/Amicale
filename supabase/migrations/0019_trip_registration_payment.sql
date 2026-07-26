-- 0019: Trip registration payment tracking
-- Adds payment detail columns to trip_registrations and normalizes
-- the 'en_attente' status to 'impaye'.

DO $$ BEGIN
  ALTER TABLE trip_registrations ADD COLUMN paid_amount NUMERIC(10,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE trip_registrations ADD COLUMN payment_mode VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE trip_registrations ADD COLUMN payment_due_date DATE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE trip_registrations ADD COLUMN paid_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Normalize legacy status value
UPDATE trip_registrations
  SET payment_status = 'impaye'
  WHERE payment_status = 'en_attente';
