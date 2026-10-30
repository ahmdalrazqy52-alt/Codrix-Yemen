/*
# Create ads, admin profiles, activity log, and log reactions tables

## Overview
This migration adds the database infrastructure for:
1. Advanced advertising system (multiple ads per slot with image/video support)
2. Admin user profiles (name, avatar, visible to other admins)
3. Activity log (tracks all CRUD actions by admins with details)
4. Log reactions (emoji reactions from admins on activity log entries)
5. RPC for adding new admin users (owner-only)

## New Tables

### 1. `ad_items`
Stores individual advertisements that rotate within ad slots.
- `id` (uuid, primary key)
- `slot` (text) - either 'hero' or 'bottom'
- `media_type` (text) - 'image' or 'video'
- `media_url` (text) - URL to the uploaded image/video in storage
- `link_url` (text) - URL to navigate to when clicked
- `duration` (integer) - display duration in seconds (for images; ignored for videos)
- `active` (boolean, default true) - whether this ad is currently active
- `sort_order` (integer, default 0) - ordering
- `created_by` (uuid) - which admin created it
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. `admin_profiles`
Stores display information for admin users.
- `user_id` (uuid, primary key, references auth.users)
- `display_name` (text) - admin's display name
- `avatar_url` (text) - URL to admin's avatar image in storage
- `updated_at` (timestamptz)

### 3. `activity_log`
Tracks all create/update/delete actions performed by admins.
- `id` (uuid, primary key)
- `admin_id` (uuid) - which admin performed the action
- `admin_name` (text) - denormalized admin display name at time of action
- `action` (text) - 'create', 'update', or 'delete'
- `target_type` (text) - what was affected: 'content', 'ad', 'admin', 'message'
- `target_id` (text) - identifier of the affected item
- `description` (text) - human-readable description of the action
- `created_at` (timestamptz)

### 4. `log_reactions`
Emoji reactions from admins on activity log entries.
- `id` (uuid, primary key)
- `log_id` (uuid, references activity_log)
- `admin_id` (uuid) - which admin reacted
- `emoji` (text) - the emoji character
- `created_at` (timestamptz)
- Unique constraint on (log_id, admin_id, emoji) to prevent duplicate reactions

## Security
- RLS enabled on all new tables
- ad_items: public read (anon+authenticated), admin write only (authenticated admin_users)
- admin_profiles: admin read only (authenticated admin_users), self-update
- activity_log: admin read only, self-insert
- log_reactions: admin read only, self-insert/delete
- All write policies check admin_users table membership

## RPC Functions
- `add_admin(email text, password text)` - SECURITY DEFINER, owner-only, creates a new auth user and adds to admin_users
- `log_action(p_action text, p_target_type text, p_target_id text, p_description text)` - SECURITY DEFINER, logs an action for the calling admin
*/

-- ============ ad_items ============
CREATE TABLE IF NOT EXISTS ad_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL CHECK (slot IN ('hero', 'bottom')),
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '#',
  duration integer NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ads" ON ad_items;
CREATE POLICY "public_read_ads" ON ad_items FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_ads" ON ad_items;
CREATE POLICY "admin_insert_ads" ON ad_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_update_ads" ON ad_items;
CREATE POLICY "admin_update_ads" ON ad_items FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_delete_ads" ON ad_items;
CREATE POLICY "admin_delete_ads" ON ad_items FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

-- ============ admin_profiles ============
CREATE TABLE IF NOT EXISTS admin_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_profiles" ON admin_profiles;
CREATE POLICY "admin_read_profiles" ON admin_profiles FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_upsert_own_profile" ON admin_profiles;
CREATE POLICY "admin_upsert_own_profile" ON admin_profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_own_profile" ON admin_profiles;
CREATE POLICY "admin_update_own_profile" ON admin_profiles FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ activity_log ============
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name text NOT NULL DEFAULT '',
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  target_type text NOT NULL CHECK (target_type IN ('content', 'ad', 'admin', 'message', 'profile')),
  target_id text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_logs" ON activity_log;
CREATE POLICY "admin_read_logs" ON activity_log FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_insert_logs" ON activity_log;
CREATE POLICY "admin_insert_logs" ON activity_log FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

-- ============ log_reactions ============
CREATE TABLE IF NOT EXISTS log_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL REFERENCES activity_log(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (log_id, admin_id, emoji)
);

ALTER TABLE log_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_reactions" ON log_reactions;
CREATE POLICY "admin_read_reactions" ON log_reactions FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_insert_reactions" ON log_reactions;
CREATE POLICY "admin_insert_reactions" ON log_reactions FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_delete_reactions" ON log_reactions;
CREATE POLICY "admin_delete_reactions" ON log_reactions FOR DELETE
TO authenticated USING (auth.uid() = admin_id);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_ad_items_slot_active ON ad_items(slot, active);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_reactions_log_id ON log_reactions(log_id);

-- ============ RPC: log_action ============
CREATE OR REPLACE FUNCTION log_action(p_action text, p_target_type text, p_target_id text, p_description text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_name text;
BEGIN
  SELECT COALESCE(p.display_name, split_part(u.email, '@', 1))
  INTO v_admin_name
  FROM auth.users u
  LEFT JOIN admin_profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();

  IF v_admin_name IS NULL THEN
    v_admin_name := 'Unknown';
  END IF;

  INSERT INTO activity_log (admin_id, admin_name, action, target_type, target_id, description)
  VALUES (auth.uid(), v_admin_name, p_action, p_target_type, p_target_id, p_description);
END;
$$;

-- ============ RPC: add_admin ============
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
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (
    v_new_user_id,
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb
  );

  INSERT INTO auth.identities (provider, user_id, identity_data, created_at, updated_at)
  VALUES (
    'email',
    v_new_user_id,
    jsonb_build_object('sub', v_new_user_id::text, 'email', lower(trim(p_email))),
    now(),
    now()
  );

  INSERT INTO admin_users (user_id, role) VALUES (v_new_user_id, 'admin');
  
  RETURN v_new_user_id;
END;
$$;

-- ============ RPC: change_admin_email ============
CREATE OR REPLACE FUNCTION change_admin_email(p_new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- Verify caller is an admin
  PERFORM 1 FROM admin_users WHERE user_id = v_uid AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE auth.users SET email = lower(trim(p_new_email)), updated_at = now()
  WHERE id = v_uid;
END;
$$;

-- ============ RPC: change_admin_password ============
CREATE OR REPLACE FUNCTION change_admin_password(p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  -- Verify caller is an admin
  PERFORM 1 FROM admin_users WHERE user_id = v_uid AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now()
  WHERE id = v_uid;
END;
$$;

-- ============ Grant execute on RPCs ============
GRANT EXECUTE ON FUNCTION log_action TO authenticated;
GRANT EXECUTE ON FUNCTION add_admin TO authenticated;
GRANT EXECUTE ON FUNCTION change_admin_email TO authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password TO authenticated;
