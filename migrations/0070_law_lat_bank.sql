-- The LAT bank (HEC Law Admission Test, lib/banks.ts latSyllabus). Students see it only once the law area opens
-- (lib/exams.ts); until then it is for staff.
--
-- bank_questions only allowed some bank ids, and SQLite can't change a CHECK, so the table is rebuilt without one: the
-- app's bank list (lib/banks.ts) is the list of banks, and a new exam no longer needs a rebuild. Copy, drop, rename,
-- then put back its index, its count triggers (migrations/0042) and the bank_served view (migrations/0014), word for
-- word. Running it again after another rebuild only copies the rows again.
--
-- Then LAT lists questions that already exist; nothing new is written here:
-- * English (20 of LAT's 75 MCQs: synonyms, antonyms, prepositions, sentence correction, spelling): every English
--   question under its own chapter, except the ones from MDCAT past papers.
-- * Mathematics (5 MCQs, basic): the easy and moderate AKU Mathematics questions in the arithmetic, percentage, ratio,
--   algebra, geometry and data chapters. The harder AKU reasoning types (quantitative comparison, data sufficiency,
--   probability, sequences) stay out.

CREATE TABLE bank_questions_new (
  bank TEXT NOT NULL,
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

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'lat', id, 'English', chapter FROM questions WHERE subject = 'English' AND paper IS NULL;

INSERT OR IGNORE INTO bank_questions (bank, question_id, subject, chapter)
SELECT 'lat', id, 'Mathematics', chapter FROM questions
WHERE subject = 'Mathematics' AND difficulty IN ('easy', 'moderate')
  AND chapter IN ('Arithmetic and number', 'Percentages', 'Ratio, rates and proportion', 'Algebra', 'Geometry and measurement', 'Data interpretation and statistics');
