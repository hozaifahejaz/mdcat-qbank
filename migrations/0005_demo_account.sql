-- A demo student account for showing the site: Season Pass until 31 August 2027, email marked confirmed.
-- Only the password's PBKDF2 hash is stored here; the password itself is kept outside the repo.
-- Change it or remove the plan from /admin/users at any time. INSERT OR IGNORE leaves an existing account alone.
INSERT OR IGNORE INTO users (id, name, email, email_verified_at, password_hash, plan, plan_expires_at, role, created_at)
VALUES (
  'c2c11c2a-d829-4214-8b9f-b6af7ec75e4f',
  'Demo Student',
  'demo@examwise.pk',
  1794200826202,
  'pbkdf2-sha256$100000$7f13b803aa463581420731f850dc2474$a34f2703baf7fa0f4124a9b00c68656fd494ac25abf198be00e818e8c36eadaa',
  'season',
  1819756799000,
  'student',
  1794200826202
);
