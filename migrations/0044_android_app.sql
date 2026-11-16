-- The Android app.
--
-- 1. Devices remember where they run ("web" for any browser, "android" for the app), the app's version, and when the
--    app last passed Google's Play Integrity check (server/integrity.ts).
-- 2. Offline packs (server/offline.ts): questions with their keys that one phone may keep for a few days, so a
--    student with a pass can practise without a connection. At most a few hundred questions per account at a time.

ALTER TABLE devices ADD COLUMN platform TEXT NOT NULL DEFAULT 'web';
ALTER TABLE devices ADD COLUMN app_version INTEGER;
ALTER TABLE devices ADD COLUMN integrity_at INTEGER;

CREATE TABLE packs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE INDEX packs_user ON packs (user_id, revoked_at);
CREATE INDEX packs_device ON packs (device_id, revoked_at);

CREATE TABLE pack_questions (
  pack_id TEXT NOT NULL REFERENCES packs (id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  PRIMARY KEY (pack_id, question_id)
);
