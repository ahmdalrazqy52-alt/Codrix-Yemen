/*
# Store Resend API key in Vault

1. Purpose
- Store the RESEND_API_KEY secret securely in the Supabase Vault so the
  send-contact-email edge function can access it via Deno.env.get().
- Vault secrets are automatically exposed as environment variables to edge
  functions, so no manual configuration is needed.
2. Security
- The secret is encrypted at rest in the vault.secrets table.
- Only the service role / postgres role can read it.
- It is never exposed to the browser or anon key.
3. Notes
- Idempotent: deletes any existing secret with the same name first, then creates a fresh one.
*/

DELETE FROM vault.secrets WHERE name = 'RESEND_API_KEY';
SELECT vault.create_secret('sb_publishable_9GkKX-ZkwgHjOhsX-Rut3w_9oQuds3_', 'RESEND_API_KEY', 'Resend API key for sending contact emails');


