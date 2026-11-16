import { beforeEach, describe, expect, it } from "vitest";
import { resetGoogleKeys, verifyGoogleIdToken } from "../oauth";
import type { Env } from "../env";

const enc = new TextEncoder();
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const part = (o: unknown) => b64url(enc.encode(JSON.stringify(o)));

const env = { GOOGLE_CLIENT_ID: "web-client.apps.googleusercontent.com" } as Env;

async function keyPair() {
  return (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair;
}

async function token(k: CryptoKeyPair, claims: Record<string, unknown>, kid = "k1") {
  const head = part({ alg: "RS256", kid, typ: "JWT" });
  const body = part(claims);
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", k.privateKey, enc.encode(`${head}.${body}`)));
  return `${head}.${body}.${b64url(sig)}`;
}

const good = () => ({ iss: "https://accounts.google.com", aud: env.GOOGLE_CLIENT_ID, sub: "1234", email: "Student@Gmail.com", email_verified: true, name: "A Student", exp: Math.floor(Date.now() / 1000) + 600 });

describe("verifyGoogleIdToken", () => {
  let k: CryptoKeyPair;
  let keys: () => Promise<JsonWebKey[]>;
  beforeEach(async () => {
    resetGoogleKeys();
    k = await keyPair();
    const pub = (await crypto.subtle.exportKey("jwk", k.publicKey)) as JsonWebKey;
    keys = async () => [{ ...pub, kid: "k1" } as unknown as JsonWebKey];
  });

  it("accepts a valid token", async () => {
    const p = await verifyGoogleIdToken(env, await token(k, good()), keys);
    expect(p).toEqual({ subject: "1234", email: "student@gmail.com", emailVerified: true, name: "A Student" });
  });

  it("refuses a token for another app", async () => {
    await expect(verifyGoogleIdToken(env, await token(k, { ...good(), aud: "someone-else" }), keys)).rejects.toMatchObject({ code: "oauth_token" });
  });

  it("refuses an expired token", async () => {
    await expect(verifyGoogleIdToken(env, await token(k, { ...good(), exp: Math.floor(Date.now() / 1000) - 5 }), keys)).rejects.toMatchObject({ code: "oauth_token" });
  });

  it("refuses a token signed by another key", async () => {
    const other = await keyPair();
    await expect(verifyGoogleIdToken(env, await token(other, good()), keys)).rejects.toMatchObject({ code: "oauth_token" });
  });

  it("refuses a token whose claims were changed after signing", async () => {
    const t = (await token(k, good())).split(".");
    t[1] = part({ ...good(), sub: "999" });
    await expect(verifyGoogleIdToken(env, t.join("."), keys)).rejects.toMatchObject({ code: "oauth_token" });
  });

  it("refuses a wrong issuer and garbage", async () => {
    await expect(verifyGoogleIdToken(env, await token(k, { ...good(), iss: "https://evil.example" }), keys)).rejects.toMatchObject({ code: "oauth_token" });
    await expect(verifyGoogleIdToken(env, "not.a.token", keys)).rejects.toMatchObject({ code: "oauth_token" });
  });
});
