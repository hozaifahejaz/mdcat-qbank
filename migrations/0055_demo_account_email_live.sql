-- 0054 matched the demo account by its seed id, but the live account has a
-- different id. Match it by its old address instead.
UPDATE users SET email = 'demo@markhorprep.com'
WHERE email = 'demo@' || 'exam' || 'wise.pk'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@markhorprep.com');
