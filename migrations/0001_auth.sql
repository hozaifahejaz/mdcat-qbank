-- Accounts, sessions and the device rule (docs/plan.md, "Devices: two registered, one active at a time").
-- Times are Unix milliseconds. IDs are random UUIDs, except sessions and tokens, which store the SHA-256 of
-- the secret the browser holds, so a leaked database can't be used to sign in.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT COLLATE NOCASE UNIQUE,
  email_verified_at INTEGER,
  phone TEXT UNIQUE,                       -- E.164, e.g. +923001234567
  password_hash TEXT,                      -- pbkdf2-sha256$iterations$salt$hash, null for phone/Google/Apple-only accounts
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'season', 'bundle', 'monthly')),
  plan_expires_at INTEGER,
  active_session_id TEXT,                  -- the one session allowed to use the account right now
  active_device_id TEXT,
  created_at INTEGER NOT NULL
);

-- Google and Apple accounts linked to a user.
CREATE TABLE identities (
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  subject TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email TEXT,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (provider, subject)
);
CREATE INDEX identities_user ON identities (user_id);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                     -- sha256 of the cookie value
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_id TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  user_agent TEXT
);
CREATE INDEX sessions_user ON sessions (user_id);

-- At most 2 devices per user with removed_at null. Enforced in the insert (server/devices.ts).
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_key TEXT NOT NULL,                -- random id the browser keeps in localStorage
  label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  removed_at INTEGER
);
CREATE UNIQUE INDEX devices_one_key_per_user ON devices (user_id, device_key) WHERE removed_at IS NULL;

-- register / takeover / remove history: the 30-day swap limit and the "too many takeovers" sharing signal.
CREATE TABLE device_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('register', 'takeover', 'remove')),
  created_at INTEGER NOT NULL
);
CREATE INDEX device_events_user_kind ON device_events (user_id, kind, created_at);

-- Single-use links: email confirmation and password reset.
CREATE TABLE tokens (
  id TEXT PRIMARY KEY,                     -- sha256 of the token in the link
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('verify_email', 'reset_password')),
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE INDEX tokens_user ON tokens (user_id, kind);

-- SMS codes when we generate them ourselves (the "console" provider in development, or a direct SMS gateway).
-- Twilio Verify keeps its own codes and doesn't use this.
CREATE TABLE otp_codes (
  phone TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

-- Fixed-window counters for rate limits (per IP, per phone, per email).
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
