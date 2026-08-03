-- Migration 0044: Add composite index on commission_settings for faster lookups
-- and ensure unique constraint on (commission_id, key).

CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_settings_commission_key
  ON commission_settings (commission_id, key);

CREATE INDEX IF NOT EXISTS idx_commission_activities_type
  ON commission_activities (commission_id, type);

CREATE INDEX IF NOT EXISTS idx_commission_contacts_type
  ON commission_contacts (commission_id, type);

CREATE INDEX IF NOT EXISTS idx_commission_items_status
  ON commission_items (commission_id, status);
