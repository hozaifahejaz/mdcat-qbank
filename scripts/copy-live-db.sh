#!/usr/bin/env bash
# Copies the live database (mdcat-qbank-eu) over the experiments one (mdcat-qbank-experiments), so the experiments site
# has today's questions and accounts. The experiments copy is wiped first. Sign-in sessions and one-time codes are not
# kept, so everyone signs in again there. Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail

npx wrangler d1 export mdcat-qbank-eu --remote --output live.sql

# Empty the experiments copy: drop every view and table it has now.
npx wrangler d1 execute mdcat-qbank-experiments --remote --env preview --json \
  --command "SELECT type, name FROM sqlite_master WHERE type IN ('view', 'table') AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY type = 'table', rowid DESC" \
  > tables.json
node -e '
  const out = JSON.parse(require("fs").readFileSync("tables.json", "utf8"));
  const rows = out.flatMap((r) => r.results);
  const sql = ["PRAGMA defer_foreign_keys = true;", ...rows.map((t) => `DROP ${t.type.toUpperCase()} IF EXISTS "${t.name}";`)].join("\n");
  require("fs").writeFileSync("drop.sql", sql + "\n");
  console.log("Dropping", rows.length, "views and tables");
'
npx wrangler d1 execute mdcat-qbank-experiments --remote --env preview --file drop.sql --yes

npx wrangler d1 execute mdcat-qbank-experiments --remote --env preview --file live.sql --yes

npx wrangler d1 execute mdcat-qbank-experiments --remote --env preview --yes \
  --command "DELETE FROM sessions; DELETE FROM tokens; DELETE FROM otp_codes; DELETE FROM rate_limits;"

rm -f live.sql tables.json drop.sql
echo "Experiments database now matches live."
