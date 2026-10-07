/*
# Create the protected admin dashboard foundation

1. New tables
- `admin_users`
  - `user_id`: authenticated Supabase user who may access the dashboard.
  - `role`: currently `owner` or `admin`.
  - `active`: allows access to be disabled without deleting history.
  - `created_at`: when access was granted.
- `site_content`
  - `section`: unique content area name such as `settings`, `home`, or `faq`.
  - `content`: JSON document containing editable site values.
  - `updated_by` and `updated_at`: audit information for the latest change.

2. Functions
- `is_admin()`: server-side access check used by policies.
- `bootstrap_admin()`: one-time first-owner claim for the first authenticated account. It is atomic and refuses to run after an owner exists.

3. Existing table access
- `contact_messages`: authenticated administrators may read, update, and delete messages. Anonymous visitors retain INSERT only for the public contact form.

4. Security
- Row-level security is enabled on both new tables.
- Public visitors can read published site content but cannot write it.
- Only active authenticated administrators can manage content and contact messages.
- Client roles cannot insert or alter `admin_users`; access begins only through the guarded bootstrap function.
- No existing rows or columns are deleted or changed.
*/

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
  section text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.admin_users (user_id, role)
  SELECT auth.uid(), 'owner'
  WHERE NOT EXISTS (SELECT 1 FROM public.admin_users);

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true
  ) THEN
    RAISE EXCEPTION 'Admin access is already configured';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.bootstrap_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;

DROP POLICY IF EXISTS "admins_read_admin_users" ON public.admin_users;
CREATE POLICY "admins_read_admin_users" ON public.admin_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admins_insert_admin_users" ON public.admin_users;
CREATE POLICY "admins_insert_admin_users" ON public.admin_users
  FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "admins_update_admin_users" ON public.admin_users;
CREATE POLICY "admins_update_admin_users" ON public.admin_users
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "admins_delete_admin_users" ON public.admin_users;
CREATE POLICY "admins_delete_admin_users" ON public.admin_users
  FOR DELETE TO authenticated
  USING (false);

DROP POLICY IF EXISTS "public_read_site_content" ON public.site_content;
CREATE POLICY "public_read_site_content" ON public.site_content
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admins_insert_site_content" ON public.site_content;
CREATE POLICY "admins_insert_site_content" ON public.site_content
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND updated_by = auth.uid());

DROP POLICY IF EXISTS "admins_update_site_content" ON public.site_content;
CREATE POLICY "admins_update_site_content" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin() AND updated_by = auth.uid());

DROP POLICY IF EXISTS "admins_delete_site_content" ON public.site_content;
CREATE POLICY "admins_delete_site_content" ON public.site_content
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_read_contact_messages" ON public.contact_messages;
CREATE POLICY "admins_read_contact_messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_update_contact_messages" ON public.contact_messages;
CREATE POLICY "admins_update_contact_messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_delete_contact_messages" ON public.contact_messages;
CREATE POLICY "admins_delete_contact_messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (public.is_admin());

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
