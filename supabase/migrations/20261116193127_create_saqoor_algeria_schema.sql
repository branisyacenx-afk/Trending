/*
# Saqoor Algeria (صقور الجزائر) - Trading Bot Platform Schema

## Overview
A fully free MT5 trading bot platform where users sign up, submit their trading account,
and get approved by an admin. The platform tracks bot status, trade history, and performance.

## Tables

### 1. `profiles`
- Extends auth.users with additional user data
- `id` (uuid, PK, references auth.users)
- `email` (text, unique)
- `full_name` (text, optional)
- `phone` (text, optional)
- `is_admin` (boolean, default false) - admin flag
- `created_at` (timestamp)

### 2. `accounts`
- Trading accounts submitted by users for approval
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users)
- `account_number` (text) - MT5 account number
- `broker_name` (text) - broker name
- `status` (text) - 'pending', 'approved', 'rejected'
- `plan` (text) - 'free' (all plans are free)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 3. `trades`
- Live trade history for each account
- `id` (uuid, PK)
- `account_id` (uuid, references accounts)
- `user_id` (uuid, references auth.users)
- `symbol` (text) - trading pair
- `type` (text) - 'buy' or 'sell'
- `volume` (numeric) - lot size
- `open_price` (numeric)
- `close_price` (numeric, nullable)
- `profit` (numeric) - profit/loss
- `status` (text) - 'open', 'closed'
- `opened_at` (timestamp)
- `closed_at` (timestamp, nullable)

### 4. `bot_status`
- Current bot status per account
- `id` (uuid, PK)
- `account_id` (uuid, references accounts, unique)
- `user_id` (uuid, references auth.users)
- `is_running` (boolean, default false)
- `balance` (numeric, default 0)
- `last_24h_pnl` (numeric, default 0)
- `updated_at` (timestamp)

### 5. `payment_requests`
- Even though the platform is free, users can request plan activation
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users)
- `account_id` (uuid, references accounts)
- `status` (text) - 'pending', 'approved', 'rejected'
- `created_at` (timestamp)

### 6. `settings`
- Global platform settings (admin managed)
- `id` (uuid, PK)
- `key` (text, unique)
- `value` (text)
- `updated_at` (timestamp)

### 7. `support_messages`
- Messages from users to support
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users)
- `subject` (text)
- `message` (text)
- `status` (text) - 'open', 'resolved'
- `created_at` (timestamp)

## Security
- RLS enabled on all tables
- Profiles: users can read/update their own; admins can read all
- Accounts: users can CRUD their own; admins can read/update all
- Trades: users can read their own; admins can read all
- Bot status: users can read their own; admins can read/update all
- Payment requests: users can create/read their own; admins can read/update all
- Settings: admin-only write; all authenticated can read
- Support messages: users can create/read their own; admins can read all
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  broker_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO authenticated;

DROP POLICY IF EXISTS "select_own_accounts" ON accounts;
CREATE POLICY "select_own_accounts"
  ON accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_accounts" ON accounts;
CREATE POLICY "insert_own_accounts"
  ON accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_accounts" ON accounts;
CREATE POLICY "update_own_accounts"
  ON accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "delete_own_accounts" ON accounts;
CREATE POLICY "delete_own_accounts"
  ON accounts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  volume numeric NOT NULL DEFAULT 0,
  open_price numeric NOT NULL DEFAULT 0,
  close_price numeric,
  profit numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON trades TO authenticated;

DROP POLICY IF EXISTS "select_own_trades" ON trades;
CREATE POLICY "select_own_trades"
  ON trades FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_trades" ON trades;
CREATE POLICY "insert_own_trades"
  ON trades FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trades" ON trades;
CREATE POLICY "update_own_trades"
  ON trades FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trades" ON trades;
CREATE POLICY "delete_own_trades"
  ON trades FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Bot status table
CREATE TABLE IF NOT EXISTS bot_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  is_running boolean NOT NULL DEFAULT false,
  balance numeric NOT NULL DEFAULT 0,
  last_24h_pnl numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_status ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON bot_status TO authenticated;

DROP POLICY IF EXISTS "select_own_bot_status" ON bot_status;
CREATE POLICY "select_own_bot_status"
  ON bot_status FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_bot_status" ON bot_status;
CREATE POLICY "insert_own_bot_status"
  ON bot_status FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bot_status" ON bot_status;
CREATE POLICY "update_own_bot_status"
  ON bot_status FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "delete_own_bot_status" ON bot_status;
CREATE POLICY "delete_own_bot_status"
  ON bot_status FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON payment_requests TO authenticated;

DROP POLICY IF EXISTS "select_own_payment_requests" ON payment_requests;
CREATE POLICY "select_own_payment_requests"
  ON payment_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_payment_requests" ON payment_requests;
CREATE POLICY "insert_own_payment_requests"
  ON payment_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_payment_requests" ON payment_requests;
CREATE POLICY "update_own_payment_requests"
  ON payment_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON settings TO authenticated;
GRANT INSERT, UPDATE ON settings TO authenticated;

DROP POLICY IF EXISTS "select_settings" ON settings;
CREATE POLICY "select_settings"
  ON settings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "modify_settings" ON settings;
CREATE POLICY "modify_settings"
  ON settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "update_settings" ON settings;
CREATE POLICY "update_settings"
  ON settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON support_messages TO authenticated;

DROP POLICY IF EXISTS "select_own_support_messages" ON support_messages;
CREATE POLICY "select_own_support_messages"
  ON support_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "insert_own_support_messages" ON support_messages;
CREATE POLICY "insert_own_support_messages"
  ON support_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_support_messages" ON support_messages;
CREATE POLICY "update_own_support_messages"
  ON support_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_bot_status_user_id ON bot_status(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;