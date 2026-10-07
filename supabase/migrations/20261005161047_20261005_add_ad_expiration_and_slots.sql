-- Add expiration date to ad_items
ALTER TABLE ad_items ADD COLUMN IF NOT EXISTS valid_until timestamptz;

-- Create ad_slots table for custom ad spaces
CREATE TABLE IF NOT EXISTS ad_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT 'custom',
  width text NOT NULL DEFAULT 'full',
  height text NOT NULL DEFAULT '200px',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add slot_ref to ad_items to support custom slots
ALTER TABLE ad_items ADD COLUMN IF NOT EXISTS slot_id uuid REFERENCES ad_slots(id) ON DELETE SET NULL;

-- Enable RLS on ad_slots
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

-- Public can read active slots
CREATE POLICY "Public can read active ad slots"
  ON ad_slots FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Only admins can manage slots
CREATE POLICY "Admins can insert ad slots"
  ON ad_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
  );

CREATE POLICY "Admins can update ad slots"
  ON ad_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
  );

CREATE POLICY "Admins can delete ad slots"
  ON ad_slots FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
  );
