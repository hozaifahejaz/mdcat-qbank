/* What a page showed last time, kept so the next visit can show it at once while the fresh copy loads.
   Held in memory for moving between pages, and (for the plain numbers only) in sessionStorage so a reload is
   instant too. Lists that carry answers and explanations stay in memory. Emptied on sign-out. */
const PREFIX = "seen:";
const mem = new Map<string, unknown>();

export function seen<T>(key: string, persist = false): T | undefined {
  if (mem.has(key)) return mem.get(key) as T;
  if (!persist) return undefined;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (raw === null) return undefined;
    const v = JSON.parse(raw) as T;
    mem.set(key, v);
    return v;
  } catch {
    return undefined;
  }
}

export function keep(key: string, value: unknown, persist = false) {
  mem.set(key, value);
  if (persist) try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
}

export function forgetAll() {
  mem.clear();
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(PREFIX)) sessionStorage.removeItem(k);
    }
  } catch {}
}

/* Hands `show` the last copy straight away (if there is one), then the fresh one. Rejects only when the load fails
   and there was nothing to show. */
export function fresh<T>(key: string, load: () => Promise<T>, show: (v: T) => void, persist = false): Promise<void> {
  const old = seen<T>(key, persist);
  if (old !== undefined) show(old);
  return load().then(
    (v) => { keep(key, v, persist); show(v); },
    (e) => { if (old === undefined) throw e; },
  );
}
