-- The site is now called Markhor Prep. The Logical Reasoning questions from migration 0035 name the brand in their
-- source line, which students see under each explanation, so swap the old name there. Account emails are left alone.
UPDATE questions
SET source = REPLACE(source, 'Examwise original question', 'Markhor Prep original question')
WHERE source LIKE 'Examwise original question%';

-- A question being re-checked shows students its live_copy, so fix the saved copy too.
UPDATE questions
SET live_copy = json_set(live_copy, '$.source', REPLACE(json_extract(live_copy, '$.source'), 'Examwise original question', 'Markhor Prep original question'))
WHERE live_copy IS NOT NULL AND json_extract(live_copy, '$.source') LIKE 'Examwise original question%';
