import type { Env } from "./env";
import { fail } from "./http";

/* Cloudflare Turnstile. Only enforced when TURNSTILE_SECRET_KEY is set; the pages show the widget whenever
   /api/auth/config hands them a site key, so set both together. */
export async function checkCaptcha(env: Env, token: unknown, ip: string): Promise<void> {
  if (!env.TURNSTILE_SECRET_KEY) return;
  if (typeof token !== "string" || !token) throw fail(400, "captcha_required", "Please complete the check above.");
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const out = (await res.json()) as { success?: boolean };
  if (!out.success) throw fail(400, "captcha_failed", "The check didn't go through. Please try it again.");
}
