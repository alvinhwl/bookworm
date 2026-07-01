-- =============================================================================
-- Bookworm v2 — Run this ONCE in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================

CREATE TYPE book_format AS ENUM ('physical', 'ebook', 'audiobook');
CREATE TYPE reading_status AS ENUM ('want_to_read', 'currently_reading', 'finished', 'dnf');

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE books (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id           UUID,
  volume_number           INT CHECK (volume_number IS NULL OR volume_number >= 1),
  title                   TEXT NOT NULL,
  author                  TEXT NOT NULL,
  format                  book_format NOT NULL DEFAULT 'physical',
  status                  reading_status NOT NULL DEFAULT 'want_to_read',
  cover_url               TEXT,
  isbn                    TEXT,
  published_year          INT,
  total_pages             INT,
  total_duration_minutes  INT,
  current_progress        INT NOT NULL DEFAULT 0,
  notes                   TEXT NOT NULL DEFAULT '',
  started_at              DATE,
  finished_at             DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX books_user_id_idx ON books(user_id);
CREATE INDEX books_status_idx ON books(user_id, status);
CREATE INDEX books_finished_at_idx ON books(user_id, finished_at);

CREATE TABLE reading_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id    UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  value      INT NOT NULL,
  note       TEXT,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reading_log_book_id_idx ON reading_log(book_id, logged_at DESC);

CREATE TABLE user_settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  annual_goal   INT,
  default_view  TEXT NOT NULL DEFAULT 'list',
  default_sort  JSONB NOT NULL DEFAULT '{"field":"created_at","direction":"desc"}',
  theme         TEXT NOT NULL DEFAULT 'light',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE migration_runs (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  books_added INT NOT NULL DEFAULT 0,
  logs_added  INT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY books_select ON books FOR SELECT USING (user_id = auth.uid());
CREATE POLICY books_insert ON books FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY books_update ON books FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY books_delete ON books FOR DELETE USING (user_id = auth.uid());

CREATE POLICY reading_log_select ON reading_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY reading_log_insert ON reading_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY reading_log_update ON reading_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY reading_log_delete ON reading_log FOR DELETE USING (user_id = auth.uid());

CREATE POLICY user_settings_select ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_settings_insert ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY migration_runs_select ON migration_runs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY migration_runs_insert ON migration_runs FOR INSERT WITH CHECK (user_id = auth.uid());