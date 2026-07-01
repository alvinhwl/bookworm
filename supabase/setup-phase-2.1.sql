-- =============================================================================
-- Bookworm v2.1 — Run in Supabase SQL Editor AFTER setup-all.sql
-- =============================================================================

CREATE TYPE volume_mode AS ENUM ('named', 'numbered');

CREATE TABLE collections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  author                TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  cover_url             TEXT,
  volume_mode           volume_mode NOT NULL,
  expected_volume_count INT CHECK (expected_volume_count IS NULL OR expected_volume_count >= 1),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX collections_user_id_idx ON collections(user_id);

ALTER TABLE books
  ADD CONSTRAINT books_collection_id_fkey
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX tags_user_id_idx ON tags(user_id);

CREATE TABLE book_tags (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);

CREATE INDEX book_tags_tag_id_idx ON book_tags(tag_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY collections_select ON collections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY collections_insert ON collections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY collections_update ON collections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY collections_delete ON collections FOR DELETE USING (user_id = auth.uid());

CREATE POLICY tags_select ON tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY tags_insert ON tags FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY tags_update ON tags FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY tags_delete ON tags FOR DELETE USING (user_id = auth.uid());

CREATE POLICY book_tags_all ON book_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM books WHERE books.id = book_tags.book_id AND books.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM books WHERE books.id = book_tags.book_id AND books.user_id = auth.uid()
  ));