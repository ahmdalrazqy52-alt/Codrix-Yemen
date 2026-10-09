-- Robust owner-only admin creation for Codrix Yemen.
CREATE OR REPLACE FUNCTION public.add_admin(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_caller_role text;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_new_user_id uuid;
BEGIN
  SELECT role INTO v_caller_role FROM public.admin_users
  WHERE user_id = v_caller_id AND active = true LIMIT 1;
  IF v_caller_role IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'Only owners can add new admins';
  END IF;
  IF v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;
  IF length(coalesce(p_password, '')) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  SELECT id INTO v_new_user_id FROM auth.users WHERE lower(email) = v_email LIMIT 1;
  IF v_new_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_new_user_id) THEN
      UPDATE public.admin_users SET active = true WHERE user_id = v_new_user_id;
      RETURN v_new_user_id;
    END IF;
    INSERT INTO public.admin_users (user_id, role, active) VALUES (v_new_user_id, 'admin', true);
    RETURN v_new_user_id;
  END IF;

  v_new_user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) VALUES (
    v_new_user_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(), now(), now(), now(),
    jsonb_build_object('provider','email','providers',jsonb_build_array('email')),
    '{}'::jsonb, false, false
  );

  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, email, created_at, updated_at)
  VALUES (v_new_user_id::text, v_new_user_id,
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_email),
    'email', v_email, now(), now());

  INSERT INTO public.admin_users (user_id, role, active) VALUES (v_new_user_id, 'admin', true);
  INSERT INTO public.admin_profiles (user_id, display_name, updated_at)
  VALUES (v_new_user_id, split_part(v_email, '@', 1), now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN v_new_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.add_admin(text,text) TO authenticated;

CREATE INDEX IF NOT EXISTS contact_messages_status_created_idx
ON public.contact_messages(status, created_at DESC);
