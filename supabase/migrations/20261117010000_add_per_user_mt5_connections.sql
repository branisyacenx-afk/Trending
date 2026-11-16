-- Per-user MT5 account registry. Never store broker passwords or investor passwords here.
-- Credentials must live in a dedicated secret manager and be referenced by secret_ref only.
CREATE TABLE IF NOT EXISTS public.mt5_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_label text NOT NULL CHECK (char_length(account_label) BETWEEN 2 AND 80),
  broker_name text NOT NULL CHECK (char_length(broker_name) BETWEEN 2 AND 120),
  server_name text NOT NULL CHECK (char_length(server_name) BETWEEN 2 AND 160),
  account_login text NOT NULL CHECK (account_login ~ '^[0-9]{4,20}$'),
  account_type text NOT NULL DEFAULT 'demo' CHECK (account_type IN ('demo','real')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','provisioning','connected','disconnected','error','suspended')),
  secret_ref text UNIQUE,
  worker_id text,
  last_seen_at timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, broker_name, server_name, account_login)
);

CREATE INDEX IF NOT EXISTS mt5_connections_user_id_idx
  ON public.mt5_connections(user_id);
CREATE INDEX IF NOT EXISTS mt5_connections_status_idx
  ON public.mt5_connections(status);

ALTER TABLE public.mt5_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mt5_connections FROM anon, authenticated;
GRANT SELECT, INSERT ON public.mt5_connections TO authenticated;

DROP POLICY IF EXISTS "users_read_own_mt5_connections" ON public.mt5_connections;
CREATE POLICY "users_read_own_mt5_connections"
  ON public.mt5_connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_request_own_mt5_connections" ON public.mt5_connections;
CREATE POLICY "users_request_own_mt5_connections"
  ON public.mt5_connections FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND secret_ref IS NULL
    AND worker_id IS NULL
    AND last_seen_at IS NULL
    AND last_error_code IS NULL
    AND account_type = 'demo'
  );

-- No client UPDATE/DELETE policy: only trusted service-role gateway may provision,
-- assign isolated workers, store secret references, or report broker connection state.
