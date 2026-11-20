-- Lighter visit counting for the admin Visitors page (server/visits.ts).
--
-- Each finished day is summed up once into small daily tables, and the raw page views behind it are kept only about a
-- week. The Visitors page then reads a few rows per day instead of every page view, and the page-view table stays
-- small. Days are Pakistan dates (UTC+5), as before. The first summing up happens on the first visit or Visitors page
-- load after this runs, from the page views already stored.

-- City and province from Cloudflare (no IP is stored), and whether the view was the first page of a visit.
ALTER TABLE page_views ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE page_views ADD COLUMN region TEXT NOT NULL DEFAULT '';
ALTER TABLE page_views ADD COLUMN entry INTEGER NOT NULL DEFAULT 0;

-- One index instead of two: every query now asks for a day (and the old-row clean-up goes by day), so the time index
-- only cost a write per view. Day + visitor also serves the per-visitor daily cap.
DROP INDEX IF EXISTS page_views_time;
DROP INDEX IF EXISTS page_views_day;
CREATE INDEX page_views_day_visitor ON page_views (day, visitor);

-- One row per finished day.
CREATE TABLE visit_days (
  day TEXT PRIMARY KEY,                    -- YYYY-MM-DD, Pakistan time
  visitors INTEGER NOT NULL,               -- distinct visitors that day
  views INTEGER NOT NULL,
  signed_in INTEGER NOT NULL,              -- visitors who were signed in on at least one page
  single INTEGER NOT NULL                  -- visitors who saw only one page
) WITHOUT ROWID;

-- Per finished day, the visitors and views for each page, source, place, device and so on.
-- dim: page, entry, referrer, campaign, country, region, city, device, os, browser, hour.
-- region and city keys start with the country code ("PK|Punjab", "PK|Lahore"); hour is "00" to "23", Pakistan time.
CREATE TABLE visit_stats (
  day TEXT NOT NULL,
  dim TEXT NOT NULL,
  key TEXT NOT NULL,
  visitors INTEGER NOT NULL,
  views INTEGER NOT NULL,
  PRIMARY KEY (day, dim, key)
) WITHOUT ROWID;
