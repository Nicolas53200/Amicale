-- 0021: Event registration deadline, visibility, and guard trigger
-- Adds a registration_deadline and visibility column to events,
-- plus a trigger that refuses inserts into event_registrations when
-- the event is not published, is past its date, or is at capacity.

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN registration_deadline TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD COLUMN visibility VARCHAR(30) DEFAULT 'all';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- CHECK on visibility values
DO $$ BEGIN
  ALTER TABLE events
    ADD CONSTRAINT chk_event_visibility
    CHECK (visibility IN ('all', 'members_only', 'bureau_only'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Guard function: refuse registration when conditions are not met
CREATE OR REPLACE FUNCTION check_event_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_event RECORD;
  v_count INTEGER;
BEGIN
  SELECT status, date, max_attendees, registration_deadline
    INTO v_event
    FROM events
    WHERE id = NEW.event_id;

  -- Event must be published
  IF v_event.status IS DISTINCT FROM 'publie' THEN
    RAISE EXCEPTION 'Les inscriptions ne sont pas ouvertes pour cet evenement (statut: %)', COALESCE(v_event.status, 'inconnu');
  END IF;

  -- Event must not be past
  IF v_event.date < now() THEN
    RAISE EXCEPTION 'Cet evenement est deja passe';
  END IF;

  -- Registration deadline must not be past (if set)
  IF v_event.registration_deadline IS NOT NULL AND v_event.registration_deadline < now() THEN
    RAISE EXCEPTION 'La date limite d''inscription est depassee';
  END IF;

  -- Capacity must not be reached (if set)
  IF v_event.max_attendees IS NOT NULL THEN
    SELECT COALESCE(SUM(nb_personnes), 0) INTO v_count
      FROM event_registrations
      WHERE event_id = NEW.event_id
        AND status NOT IN ('annule', 'refuse');

    IF v_count + NEW.nb_personnes > v_event.max_attendees THEN
      RAISE EXCEPTION 'Capacite maximale atteinte (% / %)', v_count, v_event.max_attendees;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger (drop first so re-running is safe)
DROP TRIGGER IF EXISTS trg_check_event_registration ON event_registrations;

CREATE TRIGGER trg_check_event_registration
  BEFORE INSERT ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_event_registration();
