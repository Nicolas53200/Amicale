-- Migration 0010: Benevole workflow support
-- Adds benevole_status for the validation workflow (attente -> valide -> refuse)
-- Adds benevole_poste for the specific volunteer role/position

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS benevole_status VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS benevole_poste VARCHAR(100) DEFAULT NULL;

-- Index for querying benevoles by status
CREATE INDEX IF NOT EXISTS event_registrations_benevole_status_idx
  ON event_registrations(benevole_status)
  WHERE benevole_status IS NOT NULL;

-- Add status column to trip_registrations for bureau validation workflow
ALTER TABLE trip_registrations
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'en_attente';

CREATE INDEX IF NOT EXISTS trip_registrations_status_idx
  ON trip_registrations(status);
