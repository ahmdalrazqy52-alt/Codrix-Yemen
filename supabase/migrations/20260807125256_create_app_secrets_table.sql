/*
# Create app_secrets table for edge function access

1. Purpose
- Store the Resend API key in a regular table that edge functions can read
  via the service role client (which bypasses RLS).
- Vault's `vault.decrypted_secrets` is NOT accessible via PostgREST / supabase-js,
  so edge functions cannot read it directly. This table solves that.
2. New Tables
- `app_secrets`: key (text, primary key), value (text), created_at
3. Security
- RLS enabled, NO policies — only the service role (which bypasses RLS) can read.
  The anon/authenticated roles get nothing.
4. Notes
- Only the edge function (using SUPABASE_SERVICE_ROLE_KEY) can read this table.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

INSERT INTO app_secrets (key, value) VALUES
  ('RESEND_API_KEY', 'YOUR_RESEND_API_KEY')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
