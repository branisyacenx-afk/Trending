-- Trading platform hardening and account modes.
-- This migration is additive: it preserves existing account rows and defaults them to demo.

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'demo';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'accounts_account_type_check'
      AND conrelid = 'public.accounts'::regclass
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT accounts_account_type_check
      CHECK (account_type IN ('demo', 'real'));
  END IF;
END
$$;

-- Remove broad table-level write grants that let clients alter privileged fields.
REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;

REVOKE UPDATE ON public.accounts FROM authenticated;
GRANT UPDATE (status, updated_at) ON public.accounts TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.trades FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.bot_status FROM authenticated;

REVOKE UPDATE ON public.payment_requests FROM authenticated;

REVOKE UPDATE ON public.support_messages FROM authenticated;
GRANT UPDATE (status) ON public.support_messages TO authenticated;

-- Admin checks use the SECURITY DEFINER helper to avoid recursive profiles RLS.
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users may submit accounts only as pending. Only admins may change approval state.
DROP POLICY IF EXISTS "insert_own_accounts" ON public.accounts;
CREATE POLICY "insert_own_accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND plan = 'free'
  );

DROP POLICY IF EXISTS "update_own_accounts" ON public.accounts;
CREATE POLICY "admin_update_accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trading history and bot telemetry are written only by a trusted server/bridge.
DROP POLICY IF EXISTS "insert_own_trades" ON public.trades;
DROP POLICY IF EXISTS "update_own_trades" ON public.trades;
DROP POLICY IF EXISTS "delete_own_trades" ON public.trades;

DROP POLICY IF EXISTS "insert_own_bot_status" ON public.bot_status;
DROP POLICY IF EXISTS "update_own_bot_status" ON public.bot_status;
DROP POLICY IF EXISTS "delete_own_bot_status" ON public.bot_status;

-- Payment requests can be created only for an account owned by the caller.
DROP POLICY IF EXISTS "insert_own_payment_requests" ON public.payment_requests;
CREATE POLICY "insert_own_payment_requests"
  ON public.payment_requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND EXISTS (
      SELECT 1
      FROM public.accounts a
      WHERE a.id = account_id
        AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_payment_requests" ON public.payment_requests;
CREATE POLICY "admin_update_payment_requests"
  ON public.payment_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Support users can open messages; only admins can resolve them.
DROP POLICY IF EXISTS "insert_own_support_messages" ON public.support_messages;
CREATE POLICY "insert_own_support_messages"
  ON public.support_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'open');

DROP POLICY IF EXISTS "update_own_support_messages" ON public.support_messages;
CREATE POLICY "admin_update_support_messages"
  ON public.support_messages FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Replace direct profile lookups in remaining admin policies with the helper.
DROP POLICY IF EXISTS "select_own_accounts" ON public.accounts;
CREATE POLICY "select_own_accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "select_own_trades" ON public.trades;
CREATE POLICY "select_own_trades"
  ON public.trades FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "select_own_bot_status" ON public.bot_status;
CREATE POLICY "select_own_bot_status"
  ON public.bot_status FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "select_own_payment_requests" ON public.payment_requests;
CREATE POLICY "select_own_payment_requests"
  ON public.payment_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "select_own_support_messages" ON public.support_messages;
CREATE POLICY "select_own_support_messages"
  ON public.support_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
