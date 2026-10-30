-- Harden media uploads and allow admins to manage inactive ad slots.

DROP POLICY IF EXISTS "Public can read active ad slots" ON public.ad_slots;
CREATE POLICY "Public can read active ad slots" ON public.ad_slots
  FOR SELECT TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Admins can read all ad slots" ON public.ad_slots;
CREATE POLICY "Admins can read all ad slots" ON public.ad_slots
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true));

DROP POLICY IF EXISTS "auth_upload_media" ON storage.objects;
CREATE POLICY "auth_upload_media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "auth_update_media" ON storage.objects;
CREATE POLICY "auth_update_media" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true)
)
WITH CHECK (
  bucket_id = 'media'
  AND owner = auth.uid()
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true)
);

DROP POLICY IF EXISTS "auth_delete_media" ON storage.objects;
CREATE POLICY "auth_delete_media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND active = true)
);

CREATE INDEX IF NOT EXISTS idx_ad_items_slot_id_active ON public.ad_items(slot_id, active);
