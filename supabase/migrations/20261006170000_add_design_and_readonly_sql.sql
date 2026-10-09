-- Production additions: visual design rules + safe admin SQL read console.

CREATE TABLE IF NOT EXISTS public.site_design (
  id text PRIMARY KEY,
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_design ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_design" ON public.site_design;
CREATE POLICY "public_read_site_design" ON public.site_design
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_design" ON public.site_design;
CREATE POLICY "admin_insert_site_design" ON public.site_design
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND updated_by = auth.uid());

DROP POLICY IF EXISTS "admin_update_site_design" ON public.site_design;
CREATE POLICY "admin_update_site_design" ON public.site_design
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin() AND updated_by = auth.uid());

GRANT SELECT ON public.site_design TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_design TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_execute_readonly_sql(p_sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text := trim(p_sql);
  v_result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true AND role = 'owner') THEN
    RAISE EXCEPTION 'Only owners can execute the SQL console';
  END IF;
  IF v_sql = '' OR v_sql ~ ';' OR v_sql !~* '^[[:space:]]*(select|with|explain)([[:space:]]|$)' THEN
    RAISE EXCEPTION 'Only one SELECT/WITH/EXPLAIN statement is allowed';
  END IF;
  IF v_sql ~* '(^|[^[:alnum:]_])(insert|update|delete|drop|alter|create|truncate|grant|revoke|comment|refresh|vacuum|analyze)([^[:alnum:]_]|$)' THEN
    RAISE EXCEPTION 'Write or DDL statements are not allowed';
  END IF;
  SET LOCAL statement_timeout = '5s';
  EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(q)), ''[]''::jsonb) FROM (%s) q', v_sql) INTO v_result;
  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_execute_readonly_sql(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_execute_readonly_sql(text) TO authenticated;

-- Activity log needs to understand the newer design/sql actions.
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_target_type_check;
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_target_type_check
  CHECK (target_type IN ('content', 'ad', 'admin', 'message', 'profile', 'review', 'design', 'sql'));
