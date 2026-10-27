-- Staff roles, the question bank and the admin log.
-- Roles: student (everyone by default), writer (adds and edits their own drafts), reviewer (blind solves, checklist,
-- sends back), admin (everything, including users, plans and the final sign-off). Admins grant roles from /admin/users.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'writer', 'reviewer', 'admin'));

-- The site owner's account, which already exists. Anyone signing up later with this email doesn't become admin:
-- only this one-off update grants it.
UPDATE users SET role = 'admin' WHERE email = 'hozaiphaa@gmail.com';

-- Every question and where it is in the quality check (docs/plan.md). Options are a JSON array of 4 strings, wrong
-- is a JSON object of "why this option is wrong" keyed by option index, checks is the reviewer checklist as JSON booleans.
CREATE TABLE questions (
  id TEXT PRIMARY KEY,                     -- BIO-0001, CHE-0001, ...
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  source TEXT NOT NULL DEFAULT '',
  stem TEXT NOT NULL DEFAULT '',
  options TEXT NOT NULL DEFAULT '["","","",""]',
  answer INTEGER NOT NULL DEFAULT 0 CHECK (answer BETWEEN 0 AND 3),
  why TEXT NOT NULL DEFAULT '',
  wrong TEXT NOT NULL DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'draft' CHECK (stage IN ('draft', 'auto', 'blind', 'review', 'signoff', 'beta', 'live')),
  checks TEXT NOT NULL DEFAULT '[]',
  duplicate INTEGER,                       -- % word overlap with the closest other question, worked out on submit
  duplicate_of TEXT,
  blind_by TEXT REFERENCES users (id),
  blind_answer INTEGER,
  reviewed_by TEXT REFERENCES users (id),
  signed_off_by TEXT REFERENCES users (id),
  sent_back TEXT,                          -- the note when a question goes back to its writer
  writer_id TEXT NOT NULL REFERENCES users (id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX questions_stage ON questions (stage, subject);
CREATE INDEX questions_writer ON questions (writer_id);

-- Next number for each subject's question IDs.
CREATE TABLE question_counters (
  prefix TEXT PRIMARY KEY,
  n INTEGER NOT NULL
);

-- Who did what in the admin panel: stage changes, role and plan changes, device resets.
CREATE TABLE admin_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT REFERENCES users (id),
  action TEXT NOT NULL,
  target TEXT,                             -- a question ID or a user ID
  detail TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX admin_log_target ON admin_log (target, created_at);
CREATE INDEX admin_log_time ON admin_log (created_at);
