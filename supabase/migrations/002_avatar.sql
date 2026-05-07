-- Add avatar URL to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Storage: allow authenticated users to manage their own avatar file
-- (Run these after creating the 'avatars' bucket in the Supabase dashboard)
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND name = auth.uid()::text);

CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
