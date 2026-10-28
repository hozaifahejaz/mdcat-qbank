-- Site visits for the admin panel's Visitors page (server/visits.ts). No IP address or cookie is stored: a visitor
-- is a SHA-256 of a salt that changes every day, the IP and the browser, so the same person counts once a day
-- and can't be followed from one day to the next. Days are Pakistan dates (UTC+5). Staff and /admin aren't counted.

CREATE TABLE page_views (
  id INTEGER PRIMARY KEY,
  created_at INTEGER NOT NULL,
  day TEXT NOT NULL,                       -- YYYY-MM-DD, Pakistan time
  visitor TEXT NOT NULL,                   -- the daily hash, 16 hex characters
  path TEXT NOT NULL,                      -- no query string
  referrer TEXT NOT NULL DEFAULT '',       -- the other site's host only, '' for direct visits and our own pages
  campaign TEXT NOT NULL DEFAULT '',       -- ?utm_source= or ?ref= on the page, if any
  country TEXT NOT NULL DEFAULT '',        -- two-letter code from Cloudflare
  device TEXT NOT NULL DEFAULT '',         -- phone, tablet or desktop
  os TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  signed_in INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX page_views_day ON page_views (day);
CREATE INDEX page_views_time ON page_views (created_at);

-- Today's salt, and yesterday's until it's cleared. Without the old salt nobody, us included, can tie a hash back
-- to an IP.
CREATE TABLE visit_salts (
  day TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);
