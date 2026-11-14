-- Security review, November 2026.

-- The demo account becomes an ordinary student with the full plan, gets a new password, and is signed out everywhere.
UPDATE users SET role = 'student', plan = 'bundle', plan_expires_at = NULL, active_session_id = NULL, active_device_id = NULL,
  password_hash = 'pbkdf2-sha256$100000$886de0ebd4c9d9647ec12e2272e1e01e$a433ccab5597158fce673d900a9f5ef2ba0045553c7832f8d49666fcab8eae6a'
WHERE id = 'c2c11c2a-d829-4214-8b9f-b6af7ec75e4f';
DELETE FROM sessions WHERE user_id = 'c2c11c2a-d829-4214-8b9f-b6af7ec75e4f';

-- Where a session was last used from, and how often that changed lately (server/session.ts).
ALTER TABLE sessions ADD COLUMN ip TEXT;
ALTER TABLE sessions ADD COLUMN ip_changes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sessions ADD COLUMN ip_window INTEGER NOT NULL DEFAULT 0;

-- Things an admin should look at on an account: a session that moved to another browser, one used from many
-- places at once, a day's question limit reached, too many device switches.
CREATE TABLE security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX security_events_user ON security_events (user_id, created_at);
CREATE INDEX security_events_time ON security_events (created_at);
