import { b64url, randomToken, sha256 } from "./crypto";
import type { Env } from "./env";
import { cookie, fail, readCookie } from "./http";

/* Google and Apple sign-in (authorization code flow, run entirely on our side).
   The ID token comes straight from the provider's token endpoint over TLS, in exchange for a code only our
   secret can redeem, so we read its claims without fetching signing keys (as Google's docs allow). */
export type Provider = "google" | "apple";
export type OAuthProfile = { subject: string; email: string | null; emailVerified: boolean; name: string };

export const googleConfigured = (env: Env) => Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const appleConfigured = (env: Env) => Boolean(env.APPLE_SERVICES_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);

const STATE_COOKIE = "__Host-oauth";
const enc = new TextEncoder();

const callbackUrl = (request: Request, provider: Provider) => `${new URL(request.url).origin}/api/auth/oauth/${provider}/callback`;

async function pkceChallenge(verifier: string) {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(verifier))));
}

/* Step 1: send the browser to Google or Apple, remembering state (and the PKCE verifier) in a short-lived cookie.
   SameSite=None because Apple returns with a cross-site form POST. */
export async function startOAuth(env: Env, request: Request, provider: Provider, next: string): Promise<{ url: string; cookie: string }> {
  const state = randomToken(24);
  const verifier = randomToken(48);
  const redirectUri = callbackUrl(request, provider);
  let url: URL;
  if (provider === "google") {
    if (!googleConfigured(env)) throw fail(503, "provider_off", "Google sign-in isn't switched on yet.");
    url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!, redirect_uri: redirectUri, response_type: "code", scope: "openid email profile",
      state, code_challenge: await pkceChallenge(verifier), code_challenge_method: "S256", prompt: "select_account",
    }).toString();
  } else {
    if (!appleConfigured(env)) throw fail(503, "provider_off", "Apple sign-in isn't switched on yet.");
    url = new URL("https://appleid.apple.com/auth/authorize");
    url.search = new URLSearchParams({
      client_id: env.APPLE_SERVICES_ID!, redirect_uri: redirectUri, response_type: "code", scope: "name email",
      response_mode: "form_post", state,
    }).toString();
  }
  const value = JSON.stringify({ s: await sha256(state), v: verifier, n: next, p: provider });
  return { url: url.toString(), cookie: cookie(STATE_COOKIE, value, { maxAge: 600, sameSite: "None" }) };
}

export const clearStateCookie = () => cookie(STATE_COOKIE, "", { maxAge: 0, sameSite: "None" });

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split(".")[1] ?? "";
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))));
}

/* Apple wants a client secret that is a JWT signed with the .p8 key. We make a fresh one for each sign-in,
   so there is no 6-month secret to renew by hand. */
async function appleClientSecret(env: Env): Promise<string> {
  const pem = env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(enc.encode(JSON.stringify({ alg: "ES256", kid: env.APPLE_KEY_ID })));
  const body = b64url(enc.encode(JSON.stringify({ iss: env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: "https://appleid.apple.com", sub: env.APPLE_SERVICES_ID })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

/* Step 2: the provider sends the browser back with ?code (Google, GET) or a form POST (Apple). */
export async function finishOAuth(env: Env, request: Request, provider: Provider): Promise<{ profile: OAuthProfile; next: string }> {
  const params = request.method === "POST" ? new URLSearchParams(await request.text()) : new URL(request.url).searchParams;
  const error = params.get("error");
  if (error) throw fail(400, "oauth_cancelled", error === "access_denied" || error === "user_cancelled_authorize" ? "Sign-in was cancelled." : "Sign-in didn't complete. Please try again.");

  const saved = (() => { try { return JSON.parse(readCookie(request, STATE_COOKIE) ?? ""); } catch { return null; } })() as { s: string; v: string; n: string; p: Provider } | null;
  const state = params.get("state") ?? "";
  if (!saved || saved.p !== provider || saved.s !== (await sha256(state))) {
    throw fail(400, "oauth_state", "That sign-in link expired. Please try again.");
  }
  const code = params.get("code");
  if (!code) throw fail(400, "oauth_code", "Sign-in didn't complete. Please try again.");

  const redirectUri = callbackUrl(request, provider);
  const form: Record<string, string> =
    provider === "google"
      ? { code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: "authorization_code", code_verifier: saved.v }
      : { code, client_id: env.APPLE_SERVICES_ID!, client_secret: await appleClientSecret(env), redirect_uri: redirectUri, grant_type: "authorization_code" };
  const res = await fetch(provider === "google" ? "https://oauth2.googleapis.com/token" : "https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  const tokens = (await res.json().catch(() => ({}))) as { id_token?: string; error?: string };
  if (!res.ok || !tokens.id_token) {
    console.error(`${provider} token exchange failed`, res.status, tokens.error);
    throw fail(502, "oauth_exchange", "Sign-in didn't complete. Please try again.");
  }

  const claims = decodeJwtPayload(tokens.id_token);
  const aud = provider === "google" ? env.GOOGLE_CLIENT_ID : env.APPLE_SERVICES_ID;
  const iss = provider === "google" ? ["https://accounts.google.com", "accounts.google.com"] : ["https://appleid.apple.com"];
  if (claims.aud !== aud || !iss.includes(String(claims.iss)) || typeof claims.sub !== "string" || Number(claims.exp) * 1000 < Date.now()) {
    throw fail(400, "oauth_token", "Sign-in didn't complete. Please try again.");
  }

  let name = provider === "google" ? String(claims.name ?? "") : "";
  if (provider === "apple") {
    // Apple sends the name once, on the first sign-in, as a separate form field.
    try {
      const u = JSON.parse(params.get("user") ?? "{}") as { name?: { firstName?: string; lastName?: string } };
      name = [u.name?.firstName, u.name?.lastName].filter(Boolean).join(" ");
    } catch {}
  }
  const verified = claims.email_verified === true || claims.email_verified === "true";
  return {
    profile: { subject: claims.sub, email: typeof claims.email === "string" ? claims.email.toLowerCase() : null, emailVerified: verified, name: name.slice(0, 80) },
    next: saved.n,
  };
}

/* ---------- Google sign-in from the Android app ----------
   The app gets an ID token straight from Google on the phone and sends it here. Unlike the browser flow above, the
   token reaches us from the phone, not from Google, so its signature is checked against Google's published keys. */

const GOOGLE_CERTS = "https://www.googleapis.com/oauth2/v3/certs";
type Jwk = JsonWebKey & { kid?: string };
let googleKeys: { at: number; keys: Jwk[] } | null = null;

async function googleKey(kid: string, fetchKeys: () => Promise<Jwk[]>): Promise<Jwk | undefined> {
  // Kept for an hour; fetched again early when Google has rotated to a key we haven't seen.
  if (!googleKeys || Date.now() - googleKeys.at > 60 * 60 * 1000 || !googleKeys.keys.some((k) => k.kid === kid)) {
    googleKeys = { at: Date.now(), keys: await fetchKeys() };
  }
  return googleKeys.keys.find((k) => k.kid === kid);
}

const defaultFetchKeys = async (): Promise<Jwk[]> => {
  const res = await fetch(GOOGLE_CERTS);
  if (!res.ok) throw fail(502, "oauth_keys", "Sign-in didn't complete. Please try again.");
  return ((await res.json()) as { keys?: Jwk[] }).keys ?? [];
};

function b64urlBytes(part: string): Uint8Array {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/* Checks an ID token from the app and returns who it is. `fetchKeys` is only replaced in tests. */
export async function verifyGoogleIdToken(env: Env, idToken: string, fetchKeys: () => Promise<Jwk[]> = defaultFetchKeys): Promise<OAuthProfile> {
  const bad = () => fail(400, "oauth_token", "Google sign-in didn't complete. Please try again.");
  const parts = idToken.split(".");
  if (parts.length !== 3) throw bad();
  let header: { alg?: string; kid?: string };
  let claims: Record<string, unknown>;
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlBytes(parts[0]!)));
    claims = decodeJwtPayload(idToken);
  } catch {
    throw bad();
  }
  if (header.alg !== "RS256" || !header.kid) throw bad();
  const jwk = await googleKey(header.kid, fetchKeys);
  if (!jwk) throw bad();
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(parts[2]!), enc.encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw bad();
  const iss = String(claims.iss);
  if (claims.aud !== env.GOOGLE_CLIENT_ID || (iss !== "https://accounts.google.com" && iss !== "accounts.google.com")) throw bad();
  if (typeof claims.sub !== "string" || !(Number(claims.exp) * 1000 > Date.now())) throw bad();
  const verified = claims.email_verified === true || claims.email_verified === "true";
  return {
    subject: claims.sub,
    email: typeof claims.email === "string" ? claims.email.toLowerCase() : null,
    emailVerified: verified,
    name: String(claims.name ?? "").slice(0, 80),
  };
}

/* Only for tests: forget the cached keys. */
export const resetGoogleKeys = () => { googleKeys = null; };
