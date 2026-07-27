-- 0039: Anciens accounting statistics
-- Adds commission_settings keys for anciens budget configuration.
-- No new tables; uses existing commission_settings and accounting_entries.
--
-- Expected commission_settings keys for anciens:
--   'anciens_budget_previsionnel'  - annual budget plan
--     {
--       "year": 2025,
--       "total": 5000.00,
--       "categories": {
--         "repas": 2000.00,
--         "sorties": 1500.00,
--         "cadeaux": 1000.00,
--         "divers": 500.00
--       }
--     }
--
--   'anciens_cotisation_annuelle'  - annual membership fee config
--     {
--       "amount": 25.00,
--       "year": 2025,
--       "payment_methods": ["virement", "cheque", "especes"],
--       "deadline": "2025-03-31"
--     }
--
--   'anciens_statistics'  - cached statistics for dashboard
--     {
--       "total_members": 45,
--       "cotisations_paid": 38,
--       "budget_consumed": 3200.00,
--       "last_computed_at": "2025-06-01T00:00:00Z"
--     }

-- This migration is a documentation marker for the anciens commission
-- budget tracking feature. The commission_settings table (0003) already
-- supports the required key/value storage.

COMMENT ON TABLE accounting_entries IS
  'Tracks all financial entries per commission. '
  'Used by anciens commission for budget tracking with keys: '
  'anciens_budget_previsionnel, anciens_cotisation_annuelle, anciens_statistics '
  'stored in commission_settings.';
