-- Accounts remember which area they are in and which exams they are preparing for (lib/exams.ts).
--
-- area:  one of the areas in lib/exams.ts, e.g. 'medical'. NULL until the student has chosen.
-- exams: the exams they chose inside that area, comma-separated, e.g. 'mdcat,nums'. NULL until chosen.
--
-- The app serves a student only the banks of their exams (server/exams.ts), and sends an account with no choice
-- to the welcome screen. Which of their exams the app opens on stays where it was: user_prefs.bank.
--
-- Every account that exists today was made when the site had the pre-medical exams only and showed all of them, so
-- each one keeps all of them and is never asked again.

ALTER TABLE users ADD COLUMN area TEXT;
ALTER TABLE users ADD COLUMN exams TEXT;

UPDATE users SET area = 'medical', exams = 'mdcat,nums,aku';

-- So none of them is taken through the welcome screen again.
INSERT INTO user_prefs (user_id, welcomed_at, updated_at)
  SELECT id, CAST(strftime('%s', 'now') AS INTEGER) * 1000, CAST(strftime('%s', 'now') AS INTEGER) * 1000 FROM users WHERE true
  ON CONFLICT (user_id) DO UPDATE SET welcomed_at = coalesce(welcomed_at, excluded.welcomed_at);
