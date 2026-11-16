-- Two things that make the site quicker and cheaper to run, and one that makes it friendlier.
--
-- 1. Question counts. Every practice and dashboard load used to count the whole bank through the served and
--    bank_served views (tens of thousands of rows a time). The counts are now worked out once and kept in
--    site_cache; bank_version says when they are out of date. Triggers bump it whenever a question, a bank listing or a
--    report changes, so migrations that add questions and the admin panel both keep the counts right without
--    knowing about them (server/counts.ts).
-- 2. An index for the "not on the MDCAT" flag, which the MDCAT bank checks on every question it lists.
-- 3. What a student chose on the welcome screen: their test, exam year and daily goal (server/prefs.ts).

CREATE TABLE bank_version (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  v INTEGER NOT NULL
);
INSERT INTO bank_version (id, v) VALUES (1, 1);

CREATE TABLE site_cache (
  key TEXT PRIMARY KEY,
  v INTEGER NOT NULL,
  value TEXT NOT NULL,
  at INTEGER NOT NULL
);

CREATE TRIGGER bank_version_question_added AFTER INSERT ON questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_question_removed AFTER DELETE ON questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_question_changed AFTER UPDATE OF stage, subject, chapter, free, paper, mdcat, live_copy ON questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_listing_added AFTER INSERT ON bank_questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_listing_removed AFTER DELETE ON bank_questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_listing_changed AFTER UPDATE ON bank_questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_report_added AFTER INSERT ON reports
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_report_changed AFTER UPDATE OF status ON reports
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE TRIGGER bank_version_report_removed AFTER DELETE ON reports
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;

CREATE INDEX questions_not_mdcat ON questions (id) WHERE mdcat = 0;

CREATE TABLE user_prefs (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  bank TEXT,
  exam_year INTEGER,
  daily_goal INTEGER,
  welcomed_at INTEGER,
  updated_at INTEGER NOT NULL
);
