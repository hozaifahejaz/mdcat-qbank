-- The free set had no Mathematics, so a student preparing for the AKU test could not try one maths question before
-- paying. This opens ten: the first easy question of each Mathematics chapter (the first question where a chapter
-- has no easy one). The other subjects' free questions stay as they are.
UPDATE questions SET free = 1 WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY chapter ORDER BY (difficulty = 'easy') DESC, id) AS k
    FROM questions WHERE subject = 'Mathematics' AND stage = 'live' AND paper IS NULL
  ) WHERE k = 1
);
