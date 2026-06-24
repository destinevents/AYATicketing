-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 005 — Payment cancellation & auto-expiry
-- Run in Supabase SQL Editor or via: supabase db push
-- ═══════════════════════════════════════════════════════════════

-- 1. Add 'expired' to payment_status enum
--    (Postgres does not allow IF NOT EXISTS on enum values before PG 13.1;
--     this guard pattern is safe for Supabase which runs PG 15+)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'expired'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')
  ) THEN
    ALTER TYPE payment_status ADD VALUE 'expired';
  END IF;
END$$;

-- 2. Store the PayMongo checkout_session_id on the payment row so we can
--    expire it server-side when the user cancels or the 30-min window lapses.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS checkout_session_id text;

CREATE INDEX IF NOT EXISTS idx_payments_checkout_session_id
  ON payments (checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;

-- Efficient scan for the auto-expiry cron:
-- find all pending payments older than 30 minutes quickly.
CREATE INDEX IF NOT EXISTS idx_payments_pending_created
  ON payments (created_at)
  WHERE status = 'pending';
