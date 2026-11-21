-- A mock can take marks off for wrong answers in its first part (the AKU test's Science Achievement section).
-- neg_first is how many of the test's first questions do that; 0 everywhere else.
ALTER TABLE attempts ADD COLUMN neg_first INTEGER NOT NULL DEFAULT 0;
