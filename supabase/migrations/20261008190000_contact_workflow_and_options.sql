-- Codrix Yemen: contact workflow + configurable contact options
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.contact_messages
SET status = 'new'
WHERE status IS NULL OR status NOT IN ('new','read','accepted','processing','completed','cancelled');

ALTER TABLE public.contact_messages
  DROP CONSTRAINT IF EXISTS contact_messages_status_check;
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_status_check
  CHECK (status IN ('new','read','accepted','processing','completed','cancelled'));

CREATE OR REPLACE FUNCTION public.update_contact_message_status(p_id uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_uid AND active = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_status NOT IN ('new','read','accepted','processing','completed','cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.contact_messages
  SET status = p_status,
      read_at = CASE WHEN p_status <> 'new' AND read_at IS NULL THEN now() ELSE read_at END,
      updated_at = now()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_contact_message_status(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.remove_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_caller AND role = 'owner' AND active = true) THEN
    RAISE EXCEPTION 'Only owners can remove admins';
  END IF;
  IF p_user_id = v_caller THEN
    RAISE EXCEPTION 'Cannot remove yourself';
  END IF;
  UPDATE public.admin_users SET active = false WHERE user_id = p_user_id AND role = 'admin';
  RETURN FOUND;
END;
$$;
GRANT EXECUTE ON FUNCTION public.remove_admin(uuid) TO authenticated;

-- Make the admin creation RPC stricter and return readable errors.
CREATE OR REPLACE FUNCTION public.add_admin(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_new_user_id uuid;
  v_email text := lower(trim(p_email));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_caller_id AND role = 'owner' AND active = true) THEN
    RAISE EXCEPTION 'Only owners can add new admins';
  END IF;
  IF v_email = '' OR position('@' in v_email) < 2 THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;
  IF length(p_password) < 6 THEN
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

  v_new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) VALUES (
    v_new_user_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, false
  );

  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, email, created_at, updated_at)
  VALUES (v_new_user_id::text, v_new_user_id,
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_email),
    'email', v_email, now(), now());

  INSERT INTO public.admin_users (user_id, role, active) VALUES (v_new_user_id, 'admin', true);
  RETURN v_new_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.add_admin(text,text) TO authenticated;
