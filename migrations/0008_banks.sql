-- Question banks: FSc Part 1, FSc Part 2, MDCAT, NUMS MDCAT and the AKU Admission Test (lib/banks.ts). Each bank has
-- its own subjects and chapters, and a question can sit in several banks.
--
-- A question's own subject and chapter (questions table) place it in the MDCAT bank. Every other bank lists its
-- questions here, with the subject (for FSc, the textbook) and chapter it has in that bank. Nothing is listed yet:
-- which questions go in which bank gets decided as the bank is written.
CREATE TABLE bank_questions (
  bank TEXT NOT NULL CHECK (bank IN ('fsc1', 'fsc2', 'nums', 'aku')),
  question_id TEXT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  PRIMARY KEY (bank, question_id)
);
CREATE INDEX bank_questions_chapter ON bank_questions (bank, subject, chapter);

-- What students are served, per bank: the served view (0004) with each bank's subject and chapter.
CREATE VIEW bank_served AS
SELECT 'mdcat' AS bank, s.id, s.subject, s.chapter, s.topic, s.free, s.open_reports FROM served s
UNION ALL
SELECT b.bank, s.id, b.subject, b.chapter, s.topic, s.free, s.open_reports
FROM bank_questions b JOIN served s ON s.id = b.question_id;
