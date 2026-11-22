/* Deletes the project's old Cloudflare Pages deployments: every preview, and every production version except the live
   one and the two before it (kept so a bad release can be rolled back). Each deployment, preview or production, keeps
   its own public address (<id>.mdcat-qbank.pages.dev, and <branch>.mdcat-qbank.pages.dev for
   previews) and keeps running the code it was built from, so old ones are copies of the site without later fixes.
   Run by the deploy workflow after a deploy to main. Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID. */
const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
const project = "mdcat-qbank";
if (!token || !account) { console.log("No Cloudflare settings; nothing removed."); process.exit(0); }

const base = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}`;
const api = async (path, init = {}) => {
  const res = await fetch(base + path, { ...init, headers: { authorization: `Bearer ${token}` } });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out.success === false) throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${JSON.stringify(out.errors ?? "")}`);
  return out;
};

// The live one is the project's current production deployment; it can't be deleted anyway, and is skipped by id.
const live = (await api("")).result?.canonical_deployment?.id;
if (!live) { console.log("Couldn't tell which deployment is live; nothing removed."); process.exit(0); }

let removed = 0, failed = 0;
// Always page 1: each pass deletes what it lists, so the next pass sees the ones after. Stops when a pass removes nothing.
for (let pass = 0; pass < 200; pass++) {
  const list = (await api("/deployments?per_page=25&page=1")).result ?? [];
  // Newest first, so the first production ones listed are the live one and the latest before it.
  const keep = new Set([live, ...list.filter((d) => d.environment === "production").slice(0, 3).map((d) => d.id)]);
  const old = list.filter((d) => !keep.has(d.id));
  if (!old.length) break;
  let gone = 0;
  for (const d of old) {
    try {
      // force: a preview that a branch address still points at is deleted too.
      await api(`/deployments/${d.id}?force=true`, { method: "DELETE" });
      gone++;
    } catch (e) {
      failed++;
      console.log(`Not removed: ${d.id} (${d.environment}) ${e.message}`);
    }
  }
  removed += gone;
  if (!gone) break;
}
console.log(`Removed ${removed} old deployment${removed === 1 ? "" : "s"}${failed ? `, ${failed} could not be removed` : ""}. Live: ${live}`);
