-- Support tickets from the contact page (/contact), answered from the admin panel (/admin/tickets).
-- A ticket is one conversation; every message in it, from the person or from staff, is a row in ticket_messages.
-- token is the secret in the private link emailed to the person, which lets them read the thread and add to it without
-- signing in. It is kept as it is (not hashed) so every email can carry the same link; the link shows only this ticket. user_id is set when they were signed in when they wrote.
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  last_from TEXT NOT NULL DEFAULT 'person' CHECK (last_from IN ('person', 'staff')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX tickets_status ON tickets (status, updated_at);
CREATE INDEX tickets_user ON tickets (user_id);

CREATE TABLE ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  from_staff INTEGER NOT NULL DEFAULT 0,
  author_id TEXT REFERENCES users (id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX ticket_messages_ticket ON ticket_messages (ticket_id, id);
