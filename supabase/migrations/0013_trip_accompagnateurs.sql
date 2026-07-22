-- Migration 0013: Trip accompagnateurs (guides) management
-- Tracks members who volunteer as accompagnateurs for trips,
-- separate from regular trip registrations (they don't consume seats).

CREATE TABLE IF NOT EXISTS trip_accompagnateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'inscrit'
    CHECK (status IN ('inscrit', 'confirme')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, member_id)
);

-- Index for querying accompagnateurs by trip
CREATE INDEX IF NOT EXISTS trip_accompagnateurs_trip_id_idx
  ON trip_accompagnateurs(trip_id);

-- Index for querying accompagnateurs by member
CREATE INDEX IF NOT EXISTS trip_accompagnateurs_member_id_idx
  ON trip_accompagnateurs(member_id);

-- RLS policies
ALTER TABLE trip_accompagnateurs ENABLE ROW LEVEL SECURITY;

-- Members can read accompagnateurs for trips in their org
CREATE POLICY "Members can view trip accompagnateurs"
  ON trip_accompagnateurs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips t
      JOIN organizations o ON o.id = t.org_id
      JOIN members m ON m.org_id = o.id
      WHERE t.id = trip_accompagnateurs.trip_id
        AND m.user_id = auth.uid()
    )
  );

-- Members can insert themselves as accompagnateur
CREATE POLICY "Members can volunteer as accompagnateur"
  ON trip_accompagnateurs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = trip_accompagnateurs.member_id
        AND m.user_id = auth.uid()
    )
  );

-- Bureau members can update status (confirm/reject)
CREATE POLICY "Bureau can update accompagnateur status"
  ON trip_accompagnateurs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.org_id = (
          SELECT t.org_id FROM trips t WHERE t.id = trip_accompagnateurs.trip_id
        )
        AND m.role IN ('bureau', 'admin')
    )
  );

-- Bureau members can delete accompagnateurs
CREATE POLICY "Bureau can delete accompagnateurs"
  ON trip_accompagnateurs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
        AND m.org_id = (
          SELECT t.org_id FROM trips t WHERE t.id = trip_accompagnateurs.trip_id
        )
        AND m.role IN ('bureau', 'admin')
    )
  );
