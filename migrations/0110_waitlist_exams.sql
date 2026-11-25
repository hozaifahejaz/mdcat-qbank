-- The exam pages (lib/exam-pages.ts) ask "Tell me when it opens" for exams that aren't open yet. Each address now
-- remembers which exams it was left for, as a comma list (e.g. "ecat,fcps1-surgery"), so the launch email for an exam
-- goes only to the people who asked about it. Older entries from the launch waitlist have none.
ALTER TABLE waitlist ADD COLUMN exams TEXT NOT NULL DEFAULT '';
