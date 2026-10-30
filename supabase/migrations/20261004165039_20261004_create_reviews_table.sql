/*
# Create reviews table

Stores user-submitted ratings and notes for the website.
- id (uuid, primary key)
- name (text) - reviewer's name
- rating (integer, 1-5) - star rating
- note (text, optional) - review note
- visible (boolean, default true) - admin can hide/show
- created_at (timestamptz)

Security:
- Public can insert reviews (anon+authenticated)
- Public can read only visible reviews
- Admins can read all and update/delete
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  note text NOT NULL DEFAULT '',
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_visible_reviews" ON reviews;
CREATE POLICY "public_read_visible_reviews" ON reviews FOR SELECT
TO anon, authenticated USING (visible = true);

DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_all_reviews" ON reviews;
CREATE POLICY "admin_read_all_reviews" ON reviews FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND active = true)
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
