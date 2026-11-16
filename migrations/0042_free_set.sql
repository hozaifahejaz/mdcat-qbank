-- The free set: 100 questions in total, split across the subjects like the real paper (45 Biology, 25 Chemistry,
-- 20 Physics, 5 English, 5 Logical Reasoning) and spread evenly through each subject's chapters, so a free account
-- meets every part of the syllabus. Only questions on the MDCAT syllabus; past-paper questions stay with the pass.
-- Any question can be moved in or out of the free set later from the admin panel (Questions, Publishing).
UPDATE questions SET free = 0 WHERE free = 1;
UPDATE questions SET free = 1 WHERE id IN (
  SELECT p.id FROM (
    SELECT id, subject,
      row_number() OVER (PARTITION BY subject ORDER BY chapter, id) - 1 AS k,
      count(*) OVER (PARTITION BY subject) AS n
    FROM questions WHERE paper IS NULL AND stage = 'live' AND mdcat = 1
  ) p
  JOIN (
    SELECT 'Biology' AS subject, 45 AS quota UNION ALL SELECT 'Chemistry', 25 UNION ALL SELECT 'Physics', 20
    UNION ALL SELECT 'English', 5 UNION ALL SELECT 'Logical Reasoning', 5
  ) q ON q.subject = p.subject
  WHERE p.n <= q.quota OR (p.k % (p.n / q.quota) = 0 AND p.k / (p.n / q.quota) < q.quota)
);
