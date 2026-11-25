-- Questions can carry a drawing: an organic structure, a circuit, a ray diagram, a graph or a set of shapes. The
-- figure is SVG text, drawn black on a clear background, and is shown under the stem (components/test/Figure.tsx).
-- It is not part of the fields the admin panel edits, so an edit's live_copy never holds it: students always see the
-- question's own figure.
ALTER TABLE questions ADD COLUMN figure TEXT NOT NULL DEFAULT '';

-- served gains the figure column. bank_served is built on served, so it is dropped and made again, word for word.
DROP VIEW IF EXISTS bank_served;
DROP VIEW IF EXISTS served;
CREATE VIEW served AS
SELECT
  q.id, q.subject, q.free, q.paper,
  CASE WHEN q.live_copy IS NULL THEN q.chapter ELSE json_extract(q.live_copy, '$.chapter') END AS chapter,
  CASE WHEN q.live_copy IS NULL THEN q.topic ELSE json_extract(q.live_copy, '$.topic') END AS topic,
  CASE WHEN q.live_copy IS NULL THEN q.difficulty ELSE json_extract(q.live_copy, '$.difficulty') END AS difficulty,
  CASE WHEN q.live_copy IS NULL THEN q.source ELSE json_extract(q.live_copy, '$.source') END AS source,
  CASE WHEN q.live_copy IS NULL THEN q.stem ELSE json_extract(q.live_copy, '$.stem') END AS stem,
  CASE WHEN q.live_copy IS NULL THEN q.options ELSE json_extract(q.live_copy, '$.options') END AS options,
  CASE WHEN q.live_copy IS NULL THEN q.answer ELSE json_extract(q.live_copy, '$.answer') END AS answer,
  CASE WHEN q.live_copy IS NULL THEN q.why ELSE json_extract(q.live_copy, '$.why') END AS why,
  CASE WHEN q.live_copy IS NULL THEN q.wrong ELSE json_extract(q.live_copy, '$.wrong') END AS wrong,
  (SELECT count(*) FROM reports r WHERE r.question_id = q.id AND r.status = 'open') AS open_reports,
  q.figure
FROM questions q
WHERE q.stage IN ('beta', 'live') OR q.live_copy IS NOT NULL;

CREATE VIEW bank_served AS
SELECT 'mdcat' AS bank, s.id, s.subject, s.chapter, s.topic, s.free, s.open_reports FROM served s
WHERE s.id NOT IN (SELECT id FROM questions WHERE mdcat = 0)
UNION ALL
SELECT b.bank, s.id, b.subject, b.chapter, s.topic, s.free, s.open_reports
FROM bank_questions b JOIN served s ON s.id = b.question_id;

-- A changed figure is a changed question for the cached counts and lists.
DROP TRIGGER IF EXISTS bank_version_question_changed;
CREATE TRIGGER bank_version_question_changed AFTER UPDATE OF stage, subject, chapter, free, paper, mdcat, live_copy, figure ON questions
BEGIN
  UPDATE bank_version SET v = v + 1 WHERE id = 1;
END;
