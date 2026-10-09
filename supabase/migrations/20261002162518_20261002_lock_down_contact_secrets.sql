/*
# Lock down contact-form database access

1. Purpose
- Remove public execution of the legacy database email function.
- Keep secrets accessible only to server-side privileged code.

2. Access changes
- `app_secrets`: no client-role table privileges.
- `contact_messages`: client roles can only insert contact messages.
- `send_contact_email(text, text, text)`: no execution for PUBLIC, anon, or authenticated; the website uses the deployed edge function instead.

3. Security notes
- Row-level security stays enabled.
- No rows, columns, or stored values are deleted or changed.
*/

REVOKE ALL PRIVILEGES ON TABLE public.app_secrets FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_contact_email(text, text, text) FROM PUBLIC, anon, authenticated;
