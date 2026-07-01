-- Create covers bucket and storage policies (run after bucket creation in dashboard)
-- Dashboard: Storage → New bucket → name: covers → Public bucket: ON

CREATE POLICY covers_select ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY covers_insert ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY covers_update ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY covers_delete ON storage.objects FOR DELETE
  USING (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );