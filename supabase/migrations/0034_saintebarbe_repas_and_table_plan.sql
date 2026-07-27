-- 0034: Sainte-Barbe repas and table plan
-- No new tables; functionality uses commission_settings keys:
--   'saintebarbe_table_plan'      - table plan storage
--   'saintebarbe_table_capacity'  - per-table capacity config
--
-- Expected JSONB structure for 'saintebarbe_table_plan':
-- {
--   "tables": [
--     {
--       "id": "table_1",
--       "name": "Table 1",
--       "capacity": 10,
--       "assignments": [
--         {
--           "member_id": "uuid",
--           "registration_id": "uuid",
--           "seat_number": 1,
--           "name": "Jean Dupont",
--           "is_child": false
--         }
--       ],
--       "position": { "x": 100, "y": 200 }
--     }
--   ],
--   "layout": "rectangle",
--   "last_modified_by": "uuid",
--   "last_modified_at": "2025-01-01T00:00:00Z"
-- }
--
-- Expected JSONB structure for 'saintebarbe_table_capacity':
-- {
--   "default_capacity": 10,
--   "total_tables": 20,
--   "table_overrides": {
--     "table_1": 12,
--     "table_prestige": 8
--   }
-- }

-- This migration is a documentation marker.
-- The commission_settings table (0003) already supports arbitrary key/value pairs.
-- No schema changes are required.

COMMENT ON TABLE commission_settings IS
  'Stores per-commission configuration as key/value pairs. '
  'Keys used by Sainte-Barbe: '
  'saintebarbe_table_plan (JSONB with tables array, assignments, layout), '
  'saintebarbe_table_capacity (JSONB with default_capacity, total_tables, table_overrides).';
