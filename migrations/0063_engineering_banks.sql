-- Engineering banks: FSc Pre-Engineering Part 1 and Part 2, ECAT (UET) and NUST NET (lib/banks.ts). Shown only to
-- staff until the engineering area opens (server/study.ts, visibleBank).
--
-- bank_questions only allowed the first four bank ids, and SQLite can't change a CHECK, so the table is rebuilt with
-- the wider list: copy, drop, rename, then put back its index, its count triggers (migrations/0042) and the
-- bank_served view (migrations/0014), word for word.
--
-- Then the engineering banks list questions that already exist; nothing new is written here:
-- * Physics and Chemistry: every question in the pre-medical FSc Part 1 and Part 2 banks, under the same textbook
--   chapter. FSc Part 1 goes into eng1, Part 2 into eng2, and both into ECAT and NET (each tests the full FSc
--   syllabus and publishes no chapter list of its own).
-- * English (ECAT and NET): the MDCAT English set, under its own chapters.
-- * Intelligence (NET): the puzzle chapters of the Logical Reasoning set (patterns and sequences, logical deductions,
--   logical problems). NUST names no Intelligence topics; the argument chapters are MDCAT-style and stay out.
-- Maths is added when the FSc Maths bank is written.

CREATE TABLE bank_questions_new (
  bank TEXT NOT NULL CHECK (bank IN ('fsc1', 'fsc2', 'nums', 'aku', 'eng1', 'eng2', 'ecat', 'net')),
  question_id TEXT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  PRIMARY KEY (bank, question_id)
);
INSERT INTO bank_questions_new (bank, question_id, subject, chapter)
SELECT bank, question_id, subject, chapter FROM bank_questions;

DROP VIEW IF EXISTS bank_served;
DROP TABLE bank_questions;
ALTER TABLE bank_questions_new RENAME TO bank_questions;

CREATE INDEX bank_questions_chapter ON bank_questions (bank, subject, chapter);

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

CREATE VIEW bank_served AS
SELECT 'mdcat' AS bank, s.id, s.subject, s.chapter, s.topic, s.free, s.open_reports FROM served s
WHERE s.id NOT IN (SELECT id FROM questions WHERE mdcat = 0)
UNION ALL
SELECT b.bank, s.id, b.subject, b.chapter, s.topic, s.free, s.open_reports
FROM bank_questions b JOIN served s ON s.id = b.question_id;

-- FSc Pre-Engineering Part 1 and Part 2: Physics and Chemistry from the FSc banks.
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'eng1', question_id, subject, chapter FROM bank_questions WHERE bank = 'fsc1' AND subject IN ('Physics', 'Chemistry');
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'eng2', question_id, subject, chapter FROM bank_questions WHERE bank = 'fsc2' AND subject IN ('Physics', 'Chemistry');

-- ECAT and NET: both FSc parts.
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'ecat', question_id, subject, chapter FROM bank_questions WHERE bank IN ('eng1', 'eng2');
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'net', question_id, subject, chapter FROM bank_questions WHERE bank IN ('eng1', 'eng2');

-- English for ECAT and NET, and NET's Intelligence part, from their own sets.
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'ecat', id, 'English', chapter FROM questions WHERE subject = 'English';
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'net', id, 'English', chapter FROM questions WHERE subject = 'English';
INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'net', id, 'Intelligence', chapter FROM questions
WHERE subject = 'Logical Reasoning' AND chapter IN ('Patterns and sequences', 'Logical deductions', 'Logical problems');
