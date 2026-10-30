/*
# Fix add_admin RPC

The previous insert into auth.identities was missing required columns
(provider_id, email). This caused errors when adding new admins.
Also added aud, role, is_sso_user, is_anonymous defaults for auth.users.
*/

CREATE OR REPLACE FUNCTION add_admin(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_caller_role text;
  v_new_user_id uuid;
BEGIN
  -- Check caller is an owner
  SELECT role INTO v_caller_role FROM admin_users WHERE user_id = v_caller_id AND active = true;
  IF v_caller_role IS NULL OR v_caller_role != 'owner' THEN
    RAISE EXCEPTION 'Only owners can add new admins';
  END IF;

  -- Check if email already exists in auth.users
  SELECT id INTO v_new_user_id FROM auth.users WHERE email = lower(trim(p_email));

  IF v_new_user_id IS NOT NULL THEN
    -- User already exists, check if already admin
    PERFORM 1 FROM admin_users WHERE user_id = v_new_user_id;
    IF FOUND THEN
      RAISE EXCEPTION 'This user is already an admin';
    END IF;
    -- Add existing user as admin
    INSERT INTO admin_users (user_id, role) VALUES (v_new_user_id, 'admin');
    RETURN v_new_user_id;
  END IF;

  -- Create new auth user
  v_new_user_id := extensions.uuid_generate_v4();
  INSERT INTO auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous
  )
  VALUES (
    v_new_user_id,
    'authenticated',
    'authenticated',
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    false
  );

  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, email, created_at, updated_at)
  VALUES (
    v_new_user_id::text,
    v_new_user_id,
    jsonb_build_object('sub', v_new_user_id::text, 'email', lower(trim(p_email))),
    'email',
    lower(trim(p_email)),
    now(),
    now()
  );

  INSERT INTO admin_users (user_id, role) VALUES (v_new_user_id, 'admin');

  RETURN v_new_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION add_admin TO authenticated;
