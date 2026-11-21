-- Each full mock's questions, kept from the first time anyone sits it. Before this a mock was worked out from the
-- whole bank every time, so adding questions to the bank changed what "Full mock 3" held and two students' scores
-- on it could no longer be compared. bank is the paper's format: 'mdcat' or 'nums'.
CREATE TABLE IF NOT EXISTS mock_sets (
  bank TEXT NOT NULL,
  mock_no INTEGER NOT NULL,
  question_ids TEXT NOT NULL,
  made_at INTEGER NOT NULL,
  PRIMARY KEY (bank, mock_no)
);
