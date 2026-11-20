-- The demo account (migration 0013) moves to the site's own domain. Its password and everything else stay the same.
-- Skipped if an account with the new address already exists.
UPDATE users SET email = 'demo@markhorprep.com'
WHERE id = 'c2c11c2a-d829-4214-8b9f-b6af7ec75e4f'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@markhorprep.com');
