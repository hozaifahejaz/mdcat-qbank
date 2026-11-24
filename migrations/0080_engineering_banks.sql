-- Engineering banks: FSc Pre-Engineering Part 1 and Part 2, ECAT (UET) and NUST NET (lib/banks.ts). Students see them
-- only once the engineering area opens (lib/exams.ts); until then they are for staff. bank_questions has no bank CHECK
-- since migrations/0070, so no table rebuild is needed here.
--
-- The engineering banks list questions that already exist; nothing new is written here:
-- * Physics and Chemistry: every question in the pre-medical FSc Part 1 and Part 2 banks, under the same textbook
--   chapter. FSc Part 1 goes into eng1, Part 2 into eng2, and both into ECAT and NET (each tests the full FSc
--   syllabus and publishes no chapter list of its own).
-- * English (ECAT and NET): the MDCAT English set, under its own chapters.
-- * Intelligence (NET): the puzzle chapters of the Logical Reasoning set (patterns and sequences, logical deductions,
--   logical problems). NUST names no Intelligence topics; the argument chapters are MDCAT-style and stay out.
-- Maths is added when the FSc Maths bank is written.

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
