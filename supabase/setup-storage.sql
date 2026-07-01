-- =============================================================================
-- Bookworm v2 — Run AFTER creating the "covers" storage bucket
-- Dashboard → Storage → New bucket → Name: covers → Public bucket: ON → Save
-- Then SQL Editor → paste this → Run
-- =============================================================================

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