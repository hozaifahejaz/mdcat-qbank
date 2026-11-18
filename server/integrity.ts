import { b64url } from "./crypto";
import type { Env } from "./env";
import { fail } from "./http";

/* Google Play Integrity: is this request from the real Markhor Prep app, installed from Play, on a real phone that hasn't
   been tampered with? The app asks Google for a token whose request hash is base64url(SHA-256("action|deviceKey")),
   sends it with the request, and this file asks Google to decode it. Only the app's own features use it (sign-in from
   the app, claiming a device from the app, offline packs); the website is unaffected.

   PLAY_INTEGRITY_MODE: "off" (default, nothing is checked), "log" (failures are noted and let through, to see what
   would be refused before switching on) or "enforce". */

export type IntegrityAction = "auth" | "claim" | "pack";
export type Verdict = {
  requestDetails?: { requestPackageName?: string; requestHash?: string; timestampMillis?: string };
  appIntegrity?: { appRecognitionVerdict?: string; packageName?: string };
  deviceIntegrity?: { deviceRecognitionVerdict?: string[] };
};
export type Mode = "off" | "log" | "enforce";

const MAX_AGE_MS = 5 * 60 * 1000;
const enc = new TextEncoder();

export const integrityMode = (env: Env): Mode => (env.PLAY_INTEGRITY_MODE === "enforce" ? "enforce" : env.PLAY_INTEGRITY_MODE === "log" ? "log" : "off");

/* The request hash the app must have asked for. */
export async function requestHash(action: IntegrityAction, deviceKey: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(`${action}|${deviceKey.toLowerCase()}`))));
}

/* Why a decoded verdict fails, or null when it passes. Kept apart from the network calls so it can be tested. */
export function judge(v: Verdict, pkg: string, hash: string, now = Date.now()): string | null {
  const r = v.requestDetails ?? {};
  if (r.requestPackageName !== pkg) return "wrong_package";
  if (r.requestHash !== hash) return "wrong_hash";
  const at = Number(r.timestampMillis);
  if (!Number.isFinite(at) || now - at > MAX_AGE_MS || at - now > 60 * 1000) return "stale";
  if (v.appIntegrity?.appRecognitionVerdict !== "PLAY_RECOGNIZED" || v.appIntegrity?.packageName !== pkg) return "app_not_recognised";
  if (!(v.deviceIntegrity?.deviceRecognitionVerdict ?? []).includes("MEETS_DEVICE_INTEGRITY")) return "device_not_trusted";
  return null;
}

/* ---------- Talking to Google ---------- */

let access: { token: string; until: number } | null = null;

function pemToDer(pem: string): Uint8Array {
  const b64 = pem.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/* An access token for the service account, from a JWT signed with its key. Cached until shortly before it ends. */
async function accessToken(env: Env): Promise<string> {
  if (access && access.until > Date.now() + 60 * 1000) return access.token;
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(env.PLAY_INTEGRITY_SA_KEY!), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = b64url(enc.encode(JSON.stringify({
    iss: env.PLAY_INTEGRITY_SA_EMAIL, scope: "https://www.googleapis.com/auth/playintegrity",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })));
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${head}.${claims}`)));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claims}.${b64url(sig)}` }),
  });
  const out = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
  if (!res.ok || !out.access_token) throw new Error(`integrity access token: ${res.status}`);
  access = { token: out.access_token, until: Date.now() + (out.expires_in ?? 3600) * 1000 };
  return access.token;
}

async function decode(env: Env, token: string): Promise<Verdict> {
  const res = await fetch(`https://playintegrity.googleapis.com/v1/${encodeURIComponent(env.ANDROID_PACKAGE!)}:decodeIntegrityToken`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken(env)}`, "content-type": "application/json" },
    body: JSON.stringify({ integrity_token: token }),
  });
  if (res.status === 400) return {}; // a malformed or forged token: judged as failing
  if (!res.ok) throw new Error(`integrity decode: ${res.status}`);
  return ((await res.json()) as { tokenPayloadExternal?: Verdict }).tokenPayloadExternal ?? {};
}

/* Checks a request from the app. Returns true when it passed, false when it failed but was let through (log mode), and
   throws 403 integrity_failed when enforcing. `noteFailure` records a failure where there is an account to tie it to.
   If Google can't be reached, the request is let through and the outage logged: an outage at Google shouldn't lock
   every student out. */
export async function checkIntegrity(
  env: Env, opts: { action: IntegrityAction; deviceKey: string; token: unknown; noteFailure?: (why: string) => Promise<unknown> },
  decodeFn: (env: Env, token: string) => Promise<Verdict> = decode,
): Promise<boolean> {
  const mode = integrityMode(env);
  if (mode === "off" || !env.ANDROID_PACKAGE || !env.PLAY_INTEGRITY_SA_EMAIL || !env.PLAY_INTEGRITY_SA_KEY) return false;
  let why: string | null;
  if (typeof opts.token !== "string" || opts.token.length < 20 || opts.token.length > 20000 || !/^[0-9a-f-]{36}$/i.test(opts.deviceKey)) {
    why = "no_token";
  } else {
    try {
      why = judge(await decodeFn(env, opts.token), env.ANDROID_PACKAGE, await requestHash(opts.action, opts.deviceKey));
    } catch (e) {
      console.error("Play Integrity unavailable", e);
      return false;
    }
  }
  if (!why) return true;
  console.warn(`Play Integrity ${opts.action} failed: ${why}`);
  await opts.noteFailure?.(`Play Integrity (${opts.action}): ${why}`);
  if (mode === "enforce") throw fail(403, "integrity_failed", "This device can't open Markhor Prep. Please use the website instead.");
  return false;
}

/* Only for tests. */
export const resetIntegrityCache = () => { access = null; };
