-- Test as a student (admin panel): while an admin's account has a test set, the site treats it as a student on a
-- chosen plan with chosen exams, so student screens can be checked without making a new account each time
-- (server/users.ts testing). JSON: {"plan":"free"|"paid","area":"medical"|null,"exams":["nums"]}. NULL when off.

ALTER TABLE users ADD COLUMN test TEXT;
