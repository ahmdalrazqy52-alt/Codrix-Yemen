/*
# Create media storage bucket

Creates a public storage bucket for uploading ad images, ad videos, logos, and admin avatars.
Sets public read policies and authenticated write policies.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "public_read_media" ON storage.objects;
CREATE POLICY "public_read_media" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'media');

-- Authenticated upload
DROP POLICY IF EXISTS "auth_upload_media" ON storage.objects;
CREATE POLICY "auth_upload_media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media');

-- Authenticated update own
DROP POLICY IF EXISTS "auth_update_media" ON storage.objects;
CREATE POLICY "auth_update_media" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid())
WITH CHECK (bucket_id = 'media');

-- Authenticated delete own
DROP POLICY IF EXISTS "auth_delete_media" ON storage.objects;
CREATE POLICY "auth_delete_media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());
