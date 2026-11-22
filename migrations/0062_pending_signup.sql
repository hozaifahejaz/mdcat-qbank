-- A sign-up with an address that already has an unconfirmed account no longer changes that account straight away.
-- The new name and password hash wait here, on the confirmation link, as JSON {"name", "hash"}, and are applied when
-- the link is opened (server/routes.ts verify-email).
ALTER TABLE tokens ADD COLUMN pending TEXT;
