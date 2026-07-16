-- Phase 1: Row Level Security policies
-- Every table is locked down: users can only access data from their own organization.
-- public.org_id() extracts the org_id from the JWT custom claim.

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Organizations: users can only see their own org
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (id = public.org_id());

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (id = public.org_id());

-- Members: scoped to org
CREATE POLICY "members_select" ON members
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "members_update" ON members
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "members_delete" ON members
  FOR DELETE USING (org_id = public.org_id());

-- Allow unauthenticated users to look up invitation codes (for onboarding)
CREATE POLICY "members_invitation_lookup" ON members
  FOR SELECT
  TO anon
  USING (invitation_code IS NOT NULL);

-- Commissions: scoped to org
CREATE POLICY "commissions_select" ON commissions
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "commissions_insert" ON commissions
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "commissions_update" ON commissions
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "commissions_delete" ON commissions
  FOR DELETE USING (org_id = public.org_id());

-- Commission members: access through commission's org
CREATE POLICY "commission_members_select" ON commission_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM commissions
      WHERE commissions.id = commission_members.commission_id
      AND commissions.org_id = public.org_id()
    )
  );

CREATE POLICY "commission_members_insert" ON commission_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM commissions
      WHERE commissions.id = commission_members.commission_id
      AND commissions.org_id = public.org_id()
    )
  );

CREATE POLICY "commission_members_delete" ON commission_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM commissions
      WHERE commissions.id = commission_members.commission_id
      AND commissions.org_id = public.org_id()
    )
  );

-- Events: scoped to org
CREATE POLICY "events_select" ON events
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (org_id = public.org_id());

-- Event registrations: access through event's org
CREATE POLICY "event_registrations_select" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.org_id = public.org_id()
    )
  );

CREATE POLICY "event_registrations_insert" ON event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.org_id = public.org_id()
    )
  );

CREATE POLICY "event_registrations_update" ON event_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.org_id = public.org_id()
    )
  );

CREATE POLICY "event_registrations_delete" ON event_registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.org_id = public.org_id()
    )
  );

-- Trips: scoped to org
CREATE POLICY "trips_select" ON trips
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "trips_insert" ON trips
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "trips_update" ON trips
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "trips_delete" ON trips
  FOR DELETE USING (org_id = public.org_id());

-- Trip registrations: access through trip's org
CREATE POLICY "trip_registrations_select" ON trip_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_registrations.trip_id
      AND trips.org_id = public.org_id()
    )
  );

CREATE POLICY "trip_registrations_insert" ON trip_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_registrations.trip_id
      AND trips.org_id = public.org_id()
    )
  );

CREATE POLICY "trip_registrations_delete" ON trip_registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_registrations.trip_id
      AND trips.org_id = public.org_id()
    )
  );

-- Assets: scoped to org
CREATE POLICY "assets_select" ON assets
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "assets_insert" ON assets
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "assets_update" ON assets
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "assets_delete" ON assets
  FOR DELETE USING (org_id = public.org_id());

-- Asset bookings: access through asset's org
CREATE POLICY "asset_bookings_select" ON asset_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_bookings.asset_id
      AND assets.org_id = public.org_id()
    )
  );

CREATE POLICY "asset_bookings_insert" ON asset_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_bookings.asset_id
      AND assets.org_id = public.org_id()
    )
  );

CREATE POLICY "asset_bookings_update" ON asset_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_bookings.asset_id
      AND assets.org_id = public.org_id()
    )
  );

CREATE POLICY "asset_bookings_delete" ON asset_bookings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM assets
      WHERE assets.id = asset_bookings.asset_id
      AND assets.org_id = public.org_id()
    )
  );

-- Accounting entries: scoped to org
CREATE POLICY "accounting_entries_select" ON accounting_entries
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "accounting_entries_insert" ON accounting_entries
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "accounting_entries_update" ON accounting_entries
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "accounting_entries_delete" ON accounting_entries
  FOR DELETE USING (org_id = public.org_id());

-- Documents: scoped to org
CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (org_id = public.org_id());

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "documents_update" ON documents
  FOR UPDATE USING (org_id = public.org_id());

CREATE POLICY "documents_delete" ON documents
  FOR DELETE USING (org_id = public.org_id());

-- Notifications: user sees only their own notifications within their org
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (
    org_id = public.org_id()
    AND (
      target_member_id IS NULL
      OR target_member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (org_id = public.org_id());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (
    org_id = public.org_id()
    AND target_member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Messages: user sees only messages they sent or received
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    org_id = public.org_id()
    AND (
      from_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      OR to_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    org_id = public.org_id()
    AND from_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_update" ON messages
  FOR UPDATE USING (
    org_id = public.org_id()
    AND to_id IN (SELECT id FROM members WHERE user_id = auth.uid())
  );
