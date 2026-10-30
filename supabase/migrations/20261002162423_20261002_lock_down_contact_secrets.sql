/*
# Lock down contact-form database access

1. Purpose
- Restrict the secrets table to the server-side service role only.
- Prevent anonymous callers from invoking the legacy email RPC now that the site uses the deployed edge function.

2. Modified tables and access
- `app_secrets`: remove table privileges from `anon` and `authenticated`; the edge function continues to access it with the service role.
- `contact_messages`: keep public INSERT access for the no-login contact form and remove unrelated table privileges from client roles.

3. Modified function access
- `send_contact_email(text, text, text)`: revoke direct execution from `anon` and `authenticated` to prevent email-abuse through the legacy database RPC.

4. Security notes
- Row-level security remains enabled on both tables.
- No rows, columns, or stored values are deleted or changed.
- The public form sends through the edge function, which validates input and performs the privileged operations server-side.
*/

REVOKE ALL PRIVILEGES ON TABLE public.app_secrets FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.contact_messages FROM anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_contact_email(text, text, text) FROM anon, authenticated;
