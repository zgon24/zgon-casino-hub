
-- Fix storage policies: scope to user-owned paths
DROP POLICY IF EXISTS "Authenticated users can upload slot images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update slot images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete slot images" ON storage.objects;

CREATE POLICY "Users can upload their own slot images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'slot-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own slot images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'slot-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own slot images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'slot-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
