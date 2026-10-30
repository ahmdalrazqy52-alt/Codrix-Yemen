/*
# Harden admin dashboard table privileges

1. Purpose
- Align table-level privileges with the row-level policies created for the admin dashboard.
- Keep public site reads and contact-form inserts working while removing unrelated client privileges.

2. Access changes
- `admin_users`: no anon access; authenticated clients can only use the policy-approved SELECT path.
- `site_content`: anon and authenticated clients can read public content; authenticated administrators receive the managed write privileges.
- `contact_messages`: anon and authenticated clients can insert public contact submissions; authenticated administrators receive read, update, and delete privileges subject to admin policies.

3. Security notes
- Row-level security remains enabled.
- No rows, columns, or stored values are deleted or changed.
*/

REVOKE ALL PRIVILEGES ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.site_content FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.site_content TO authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.contact_messages TO authenticated;
