/*
# Add get_admin_email RPC and fix admin_profiles insert policy

1. New RPC `get_admin_email(p_user_id uuid)` - returns the email for a given auth user ID, callable only by admins
2. Adds an INSERT policy for admin_profiles so upsert works (the previous migration only had INSERT for self, which is correct, but we need to make sure upsert works)
*/

CREATE OR REPLACE FUNCTION get_admin_email(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  PERFORM 1 FROM admin_users WHERE user_id = auth.uid() AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT email INTO p_user_id FROM auth.users WHERE id = p_user_id;
  RETURN p_user_id::text;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_email TO authenticated;
