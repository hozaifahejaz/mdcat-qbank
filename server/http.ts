/* Small helpers for JSON responses, cookies and request checks. */

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public extra?: Record<string, unknown>) {
    super(message);
  }
}

export const fail = (status: number, code: string, message: string, extra?: Record<string, unknown>) =>
  new HttpError(status, code, message, extra);

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ location, "cache-control": "no-store" });
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(null, { status: 302, headers });
}

export async function body<T extends Record<string, unknown>>(request: Request): Promise<Partial<T>> {
  try {
    const data = await request.json();
    return data && typeof data === "object" ? (data as Partial<T>) : {};
  } catch {
    return {};
  }
}

export const str = (v: unknown, max = 500): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/* Cross-site request forgery guard for JSON requests that change something: browsers always send Origin on those,
   and it must be ours. The session cookie is also SameSite=Lax, so this is the second lock, not the only one. */
export function assertSameOrigin(request: Request): void {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw fail(403, "bad_origin", "Request blocked.");
  assertJson(request);
}

/* Requests that change something must be JSON. */
export function assertJson(request: Request): void {
  const type = (request.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
  if (type !== "application/json") throw fail(415, "bad_type", "Expected JSON.");
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function cookie(name: string, value: string, opts: { maxAge: number; sameSite?: "Lax" | "None" }): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=${opts.sameSite ?? "Lax"}; Max-Age=${opts.maxAge}`;
}

/* The visitor's address, as limits and counts key on it. An IPv6 visitor holds a whole /64 block (billions of
   addresses to switch between), so those are cut down to the block: the first four groups. */
export function ipKey(raw: string): string {
  if (!raw.includes(":")) return raw;
  const [head = "", tail] = raw.toLowerCase().split("::");
  const front = head ? head.split(":") : [];
  const back = tail ? tail.split(":") : [];
  const groups = tail === undefined ? front : [...front, ...Array(Math.max(0, 8 - front.length - back.length)).fill("0"), ...back];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}
export const clientIp = (request: Request) => ipKey(request.headers.get("cf-connecting-ip") ?? "local");

/* Only paths on this site, so ?next= can't send anyone elsewhere. */
export function safeNext(raw: unknown): string {
  const s = typeof raw === "string" ? raw : "";
  if (!/^\/(?![\/\\])[^\s\\]*$/.test(s)) return "/dashboard";
  return s;
}
