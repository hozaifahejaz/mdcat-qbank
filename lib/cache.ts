/* What a page showed last time, kept so the next visit can show it at once while the fresh copy loads.
   Held in memory for moving between pages, and (for the plain numbers only) in the browser's storage, so a reload, a
   new tab or tomorrow's first visit opens with them too. Lists that carry answers and explanations stay in memory.
   Emptied on sign-out, on a new sign-in, and when the server says the session is gone. */
const PREFIX = "seen:";
/* A stored copy older than this is not shown: too much has changed for it to be worth a glance. */
const KEEP_MS = 14 * 24 * 60 * 60 * 1000;
const mem = new Map<string, unknown>();
/* When each copy came from the server, and loads still on their way, so pages that open within a few seconds of each
   other (or of a link being pointed at) share one request instead of asking again. */
const loadedAt = new Map<string, number>();
const loading = new Map<string, Promise<unknown>>();
/* A copy this young is shown as it is, with no new request behind it. */
export const FRESH_MS = 20_000;

export function seen<T>(key: string, persist = false): T | undefined {
  if (mem.has(key)) return mem.get(key) as T;
  if (!persist) return undefined;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return undefined;
    const kept = JSON.parse(raw) as { t: number; v: T };
    if (!kept || typeof kept.t !== "number" || Date.now() - kept.t > KEEP_MS) { localStorage.removeItem(PREFIX + key); return undefined; }
    mem.set(key, kept.v);
    return kept.v;
  } catch {
    return undefined;
  }
}

export function keep(key: string, value: unknown, persist = false) {
  mem.set(key, value);
  if (persist) try { localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value })); } catch {}
}

/* A copy that has just come from the server by another road (a test's results arrive with its submission): kept, and
   not asked for again for the next few seconds. */
export function keepFresh(key: string, value: unknown, persist = false) {
  keep(key, value, persist);
  loadedAt.set(key, Date.now());
}

export function forgetAll() {
  mem.clear();
  loadedAt.clear();
  loading.clear();
  for (const store of ["localStorage", "sessionStorage"] as const) {
    try {
      const s = window[store];
      for (let i = s.length - 1; i >= 0; i--) {
        const k = s.key(i);
        if (k?.startsWith(PREFIX)) s.removeItem(k);
      }
    } catch {}
  }
}

/* After the student answers, finishes or bookmarks something: copies still show, but the next look asks again. */
export function outdated() {
  loadedAt.clear();
}

/* One request per key at a time; its answer is kept for the next look. */
function load<T>(key: string, get: () => Promise<T>, persist: boolean): Promise<T> {
  const on = loading.get(key) as Promise<T> | undefined;
  if (on) return on;
  const p = get().then(
    (v) => { keep(key, v, persist); loadedAt.set(key, Date.now()); return v; },
  ).finally(() => { if (loading.get(key) === p) loading.delete(key); });
  loading.set(key, p);
  return p;
}

const recent = (key: string) => Date.now() - (loadedAt.get(key) ?? 0) < FRESH_MS;

/* Hands `show` the last copy straight away (if there is one), then the fresh one. A copy from the last few seconds
   needs no new request. Rejects only when the load fails and there was nothing to show. */
export function fresh<T>(key: string, get: () => Promise<T>, show: (v: T) => void, persist = false): Promise<void> {
  const old = seen<T>(key, persist);
  if (old !== undefined) show(old);
  if (old !== undefined && recent(key)) return Promise.resolve();
  return load(key, get, persist).then(
    (v) => { show(v); },
    (e) => { if (old === undefined) throw e; },
  );
}

/* Fetch a page's numbers before it opens (a link pointed at, or a quiet moment), so it opens with them. */
export function warm<T>(key: string, get: () => Promise<T>, persist = false) {
  if (recent(key) || loading.has(key)) return;
  load(key, get, persist).catch(() => {});
}

/* The answer from the last few seconds (one fetched ahead of time, say), or a new request. Memory only. */
export function cached<T>(key: string, get: () => Promise<T>): Promise<T> {
  if (recent(key) && mem.has(key)) return Promise.resolve(mem.get(key) as T);
  return load(key, get, false);
}
