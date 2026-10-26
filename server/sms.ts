import { randomCode, sha256, timingSafeEqual } from "./crypto";
import { type Env, isDev } from "./env";
import { fail } from "./http";

/* SMS codes. Twilio Verify in production: it generates the code, sends it through senders registered for
   Pakistani networks, and checks it. In development the code is printed to the terminal. Cloudflare has no SMS
   service, so this is the one part of sign-in that has to go through an outside provider. */
const twilio = (env: Env) => Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID);
export const smsConfigured = (env: Env) => twilio(env) || isDev(env);

async function twilioPost(env: Env, path: string, form: Record<string, string>) {
  const res = await fetch(`https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SERVICE_SID}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(form),
  });
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as { status?: string; code?: number; message?: string } };
}

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function sendCode(env: Env, phone: string): Promise<void> {
  if (twilio(env)) {
    const r = await twilioPost(env, "Verifications", { To: phone, Channel: "sms" });
    if (!r.ok) {
      console.error("twilio send failed", r.status, r.data);
      if (r.data.code === 60200 || r.data.code === 21211) throw fail(400, "bad_phone", "That doesn't look like a mobile number. Please check it.");
      if (r.data.code === 60203) throw fail(429, "rate_limited", "Too many codes sent to this number. Please wait a while.");
      throw fail(502, "sms_failed", "We couldn't send an SMS to that number. Check it and try again.");
    }
    return;
  }
  if (!isDev(env)) throw fail(503, "sms_off", "Phone sign-in isn't switched on yet. Please use another way.");
  const code = randomCode();
  await env.DB.prepare(
    "INSERT INTO otp_codes (phone, code_hash, expires_at, attempts) VALUES (?1, ?2, ?3, 0) ON CONFLICT (phone) DO UPDATE SET code_hash = ?2, expires_at = ?3, attempts = 0",
  ).bind(phone, await sha256(`${phone}:${code}`), Date.now() + CODE_TTL_MS).run();
  console.log(`\n[sms to ${phone}] Your code is ${code}\n`);
}

/* True if the code is right. Wrong or expired codes return false; too many wrong tries burn the code. */
export async function checkCode(env: Env, phone: string, code: string): Promise<boolean> {
  if (twilio(env)) {
    const r = await twilioPost(env, "VerificationCheck", { To: phone, Code: code });
    if (r.status === 404) return false; // expired, used, or too many attempts
    if (!r.ok) {
      console.error("twilio check failed", r.status, r.data);
      throw fail(502, "sms_failed", "We couldn't check the code just now. Please try again.");
    }
    return r.data.status === "approved";
  }
  const row = await env.DB.prepare("SELECT code_hash, expires_at, attempts FROM otp_codes WHERE phone = ?")
    .bind(phone)
    .first<{ code_hash: string; expires_at: number; attempts: number }>();
  if (!row || row.expires_at < Date.now() || row.attempts >= MAX_ATTEMPTS) return false;
  if (timingSafeEqual(row.code_hash, await sha256(`${phone}:${code}`))) {
    await env.DB.prepare("DELETE FROM otp_codes WHERE phone = ?").bind(phone).run();
    return true;
  }
  await env.DB.prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = ?").bind(phone).run();
  return false;
}
