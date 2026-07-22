-- 0011: Booking suivi checklist + message enhancements

-- Add 6-step suivi checklist to asset_bookings (matching prototype's location workflow)
ALTER TABLE asset_bookings
  ADD COLUMN IF NOT EXISTS caution_received BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS etat_lieux_entree BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cles_remises BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS etat_lieux_sortie BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cles_retournees BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS caution_returned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS refusal_reason TEXT;

-- Add message type column (currently encoded in subject prefix, now proper column)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS rsvp_status VARCHAR(20);

-- Add trip status field for suivi
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'ouvert';

-- Trip communication messages
CREATE TABLE IF NOT EXISTS trip_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  from_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trip_messages_trip_idx ON trip_messages(trip_id);

-- Meeting RSVP responses
CREATE TABLE IF NOT EXISTS meeting_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  response VARCHAR(20) NOT NULL,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, member_id)
);

CREATE INDEX IF NOT EXISTS meeting_responses_message_idx ON meeting_responses(message_id);
