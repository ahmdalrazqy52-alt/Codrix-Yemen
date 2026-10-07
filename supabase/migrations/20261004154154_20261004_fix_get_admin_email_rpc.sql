/*
# Fix get_admin_email RPC variable naming

The previous version reused the parameter `p_user_id` as the SELECT INTO target,
which is unreliable. This version uses a proper local variable.
*/

CREATE OR REPLACE FUNCTION get_admin_email(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  PERFORM 1 FROM admin_users WHERE user_id = auth.uid() AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_email TO authenticated;
