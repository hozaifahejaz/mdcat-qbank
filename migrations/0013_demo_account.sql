-- A demo account for showing the site, with the admin role (admins get full access with no end date and no
-- device limit; see server/users.ts and server/devices.ts). Email marked confirmed.
-- Only the password's PBKDF2 hash is stored here; the password itself is kept outside the repo.
-- Change its role from /admin/users at any time. INSERT OR IGNORE leaves an existing account alone.
INSERT OR IGNORE INTO users (id, name, email, email_verified_at, password_hash, plan, plan_expires_at, role, created_at)
VALUES (
  'c2c11c2a-d829-4214-8b9f-b6af7ec75e4f',
  'Demo Account',
  'demo@examwise.pk',
  1794200826202,
  'pbkdf2-sha256$100000$7f13b803aa463581420731f850dc2474$a34f2703baf7fa0f4124a9b00c68656fd494ac25abf198be00e818e8c36eadaa',
  'bundle',
  NULL,
  'admin',
  1794200826202
);
