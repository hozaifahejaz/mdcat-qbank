-- How long a student spent on each question, and a quick way to count how everyone answered a question (the
-- "answered correctly" and per-option percentages shown once an answer is out).
ALTER TABLE answers ADD COLUMN seconds INTEGER;
CREATE INDEX answers_question ON answers (question_id, answer);
