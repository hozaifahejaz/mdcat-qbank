-- Takes the 40 sample questions from 0006 back out of the bank, with every test, answer, bookmark and report that
-- used them, so stats and "My mistakes" don't point at questions that are gone. Sample questions are the ones whose
-- ID is like BIO-S01 and whose source starts "Sample question"; real questions (BIO-0001 and so on) are untouched.
-- Questions are deleted last, since every step before it finds the samples through the questions table.

-- A test that asked any sample question goes as a whole (with its answers), since its review would have holes in it.
DELETE FROM answers WHERE attempt_id IN (
  SELECT a.id FROM attempts a, json_each(a.question_ids) j
  WHERE j.value IN (SELECT id FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]')
);
DELETE FROM answers WHERE attempt_id IN (
  SELECT attempt_id FROM answers
  WHERE question_id IN (SELECT id FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]')
);
DELETE FROM attempts WHERE id IN (
  SELECT a.id FROM attempts a, json_each(a.question_ids) j
  WHERE j.value IN (SELECT id FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]')
);
DELETE FROM bookmarks
  WHERE question_id IN (SELECT id FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]');
DELETE FROM reports
  WHERE question_id IN (SELECT id FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]');
DELETE FROM questions WHERE source LIKE 'Sample question%' AND id GLOB '[A-Z]*-S[0-9][0-9]';
