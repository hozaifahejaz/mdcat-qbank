-- Students' practice on the server: the questions they're served, their tests and answers, bookmarks, reports and
-- the launch waitlist. Questions reach students only through the API (server/study.ts), never in the page code.

-- free: in the free set that free-plan accounts can practise. paper: the PMDC past-paper year it was rebuilt from.
-- live_copy / live_stage: while a live or beta question is being edited and re-checked, students keep seeing the
-- version that passed (its fields as JSON) instead of losing the question.
ALTER TABLE questions ADD COLUMN free INTEGER NOT NULL DEFAULT 0;
ALTER TABLE questions ADD COLUMN paper INTEGER;
ALTER TABLE questions ADD COLUMN live_copy TEXT;
ALTER TABLE questions ADD COLUMN live_stage TEXT;

-- One test: a practice set, timed test, mock, mini mock or past paper. question_ids is the JSON list in the order
-- asked. deadline_at is set for timed tests, so the clock is the server's and a refresh doesn't restart it.
CREATE TABLE attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('practice', 'timed', 'mock', 'mini-mock', 'past-paper')),
  mode TEXT NOT NULL CHECK (mode IN ('tutor', 'timed', 'mock')),
  title TEXT NOT NULL,
  question_ids TEXT NOT NULL,
  mock_no INTEGER,
  paper INTEGER,
  started_at INTEGER NOT NULL,
  deadline_at INTEGER,
  finished_at INTEGER,
  seconds INTEGER,
  score INTEGER,
  total INTEGER NOT NULL
);
CREATE INDEX attempts_user ON attempts (user_id, finished_at);

-- Each question of each test. counted_at is when the answer counts towards stats: when a practice answer is checked,
-- or when a timed test is submitted. Whether it was right is worked out against the served key at read time, so
-- fixing a key corrects everyone's stats.
CREATE TABLE answers (
  attempt_id TEXT NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer INTEGER,
  flagged INTEGER NOT NULL DEFAULT 0,
  checked INTEGER NOT NULL DEFAULT 0,
  counted_at INTEGER,
  PRIMARY KEY (attempt_id, idx)
);
CREATE INDEX answers_user ON answers (user_id, counted_at);
CREATE INDEX answers_user_question ON answers (user_id, question_id, counted_at);

CREATE TABLE bookmarks (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

-- Students' reports on a question. Three open reports hide it from new tests until a reviewer closes them.
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fixed', 'dismissed')),
  note TEXT NOT NULL DEFAULT '',
  resolved_by TEXT REFERENCES users (id),
  resolved_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX reports_open ON reports (status, question_id);

-- "Tell me when it opens", from the landing page before launch. contact is an email or an E.164 phone number.
CREATE TABLE waitlist (
  contact TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('email', 'phone')),
  created_at INTEGER NOT NULL
);

-- What students are served: beta and live questions, or the checked version of one being edited.
CREATE VIEW served AS
SELECT
  q.id, q.subject, q.free, q.paper,
  CASE WHEN q.live_copy IS NULL THEN q.chapter ELSE json_extract(q.live_copy, '$.chapter') END AS chapter,
  CASE WHEN q.live_copy IS NULL THEN q.topic ELSE json_extract(q.live_copy, '$.topic') END AS topic,
  CASE WHEN q.live_copy IS NULL THEN q.difficulty ELSE json_extract(q.live_copy, '$.difficulty') END AS difficulty,
  CASE WHEN q.live_copy IS NULL THEN q.source ELSE json_extract(q.live_copy, '$.source') END AS source,
  CASE WHEN q.live_copy IS NULL THEN q.stem ELSE json_extract(q.live_copy, '$.stem') END AS stem,
  CASE WHEN q.live_copy IS NULL THEN q.options ELSE json_extract(q.live_copy, '$.options') END AS options,
  CASE WHEN q.live_copy IS NULL THEN q.answer ELSE json_extract(q.live_copy, '$.answer') END AS answer,
  CASE WHEN q.live_copy IS NULL THEN q.why ELSE json_extract(q.live_copy, '$.why') END AS why,
  CASE WHEN q.live_copy IS NULL THEN q.wrong ELSE json_extract(q.live_copy, '$.wrong') END AS wrong,
  (SELECT count(*) FROM reports r WHERE r.question_id = q.id AND r.status = 'open') AS open_reports
FROM questions q
WHERE q.stage IN ('beta', 'live') OR q.live_copy IS NOT NULL;
