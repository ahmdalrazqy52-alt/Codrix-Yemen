-- Audit improvements, one-reaction-per-user, owner log management, and owner-only write SQL.
ALTER TABLE public.activity_log ADD COLUMN IF NOT EXISTS details jsonb;
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_target_type_check;
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_target_type_check
  CHECK (target_type IN ('content','ad','ad-slot','admin','message','profile','review','design','sql','settings','media'));

-- Keep only the newest reaction for each user/log, then enforce exactly one reaction per user.
DELETE FROM public.log_reactions r
USING (
  SELECT ctid, row_number() OVER (PARTITION BY log_id, admin_id ORDER BY created_at DESC, id DESC) AS rn
  FROM public.log_reactions
) duplicates
WHERE r.ctid = duplicates.ctid AND duplicates.rn > 1;
CREATE UNIQUE INDEX IF NOT EXISTS uq_log_reactions_one_per_admin
  ON public.log_reactions(log_id, admin_id);

DROP POLICY IF EXISTS "owner_delete_activity_logs" ON public.activity_log;
CREATE POLICY "owner_delete_activity_logs" ON public.activity_log
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true AND role = 'owner')
  );

CREATE OR REPLACE FUNCTION public.admin_execute_sql(p_sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_sql text := trim(p_sql);
  v_rows jsonb;
  v_count bigint;
  v_kind text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND active = true AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Only the active owner can execute write SQL';
  END IF;
  IF v_sql = '' OR v_sql ~ ';' OR v_sql ~ '--|/\*|\*/' THEN
    RAISE EXCEPTION 'Only one SQL statement without comments is allowed';
  END IF;
  IF v_sql ~* '\m(auth|storage|extensions|pg_catalog|information_schema)\.' THEN
    RAISE EXCEPTION 'System schemas cannot be accessed through this console';
  END IF;
  IF v_sql ~* '\m(admin_users|admin_profiles|activity_log|log_reactions|app_secrets|site_secrets)\M' THEN
    RAISE EXCEPTION 'This protected table cannot be modified through the SQL console';
  END IF;
  IF v_sql ~* '\m(drop|alter|create|truncate|grant|revoke|comment|refresh|vacuum|call|do|copy|execute|prepare|deallocate)\M' THEN
    RAISE EXCEPTION 'DDL and procedural SQL are not allowed in this console';
  END IF;

  IF v_sql ~* '^(select|with|explain)\M' THEN
    IF v_sql ~* '\m(insert|update|delete)\M' THEN
      RAISE EXCEPTION 'Write statements inside WITH are not allowed';
    END IF;
    SET LOCAL statement_timeout = '5s';
    EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(q)), ''[]''::jsonb) FROM (%s) q', v_sql) INTO v_rows;
    RETURN jsonb_build_object('kind','read','rows',COALESCE(v_rows,'[]'::jsonb));
  ELSIF v_sql ~* '^insert\M' THEN
    v_kind := 'insert';
  ELSIF v_sql ~* '^update\M' THEN
    v_kind := 'update';
  ELSIF v_sql ~* '^delete\M' THEN
    v_kind := 'delete';
  ELSE
    RAISE EXCEPTION 'Only SELECT/WITH/EXPLAIN or INSERT/UPDATE/DELETE are supported';
  END IF;

  SET LOCAL statement_timeout = '5s';
  EXECUTE v_sql;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  INSERT INTO public.activity_log(admin_id, admin_name, action, target_type, target_id, description, details)
  SELECT auth.uid(), COALESCE(p.display_name, split_part(u.email,'@',1)),
    CASE v_kind WHEN 'insert' THEN 'create' WHEN 'delete' THEN 'delete' ELSE 'update' END, 'sql', v_kind, 'تنفيذ أمر SQL بواسطة مالك الموقع',
    jsonb_build_object('command', v_kind, 'affected_rows', v_count)
  FROM auth.users u LEFT JOIN public.admin_profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();
  RETURN jsonb_build_object('kind',v_kind,'affected_rows',v_count,'message','تم تنفيذ الأمر بنجاح');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_execute_sql(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_execute_sql(text) TO authenticated;


CREATE OR REPLACE FUNCTION public.log_action_detailed(
  p_action text, p_target_type text, p_target_id text, p_description text, p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_name text;
BEGIN
  IF p_action NOT IN ('create','update','delete') THEN RAISE EXCEPTION 'Invalid action'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT COALESCE(NULLIF(p.display_name,''), split_part(u.email,'@',1))
  INTO v_name FROM auth.users u
  LEFT JOIN public.admin_profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();
  INSERT INTO public.activity_log(admin_id, admin_name, action, target_type, target_id, description, details)
  VALUES (auth.uid(), COALESCE(v_name,'مدير'), p_action, p_target_type, p_target_id, p_description, p_details);
END;
$$;
REVOKE ALL ON FUNCTION public.log_action_detailed(text,text,text,text,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_action_detailed(text,text,text,text,jsonb) TO authenticated;


CREATE TABLE IF NOT EXISTS public.site_layout (
  id text PRIMARY KEY DEFAULT 'default',
  section_order jsonb NOT NULL DEFAULT '["hero","services","features","process","work","team","testimonials","cta","faq","contact","reviews"]'::jsonb,
  hidden_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_layout ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_site_layout" ON public.site_layout;
CREATE POLICY "public_read_site_layout" ON public.site_layout FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_site_layout" ON public.site_layout;
CREATE POLICY "admin_insert_site_layout" ON public.site_layout FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_site_layout" ON public.site_layout;
CREATE POLICY "admin_update_site_layout" ON public.site_layout FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT SELECT ON public.site_layout TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_layout TO authenticated;
