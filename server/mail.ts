import { type Env, isDev } from "./env";
import { fail } from "./http";

/* Transactional email through Cloudflare Email Service (REST API). In development it prints to the terminal. */
export const mailConfigured = (env: Env) => Boolean(env.CF_ACCOUNT_ID && env.CF_EMAIL_API_TOKEN && env.EMAIL_FROM) || isDev(env);

export async function sendMail(env: Env, to: string, subject: string, text: string, html: string): Promise<void> {
  if (!(env.CF_ACCOUNT_ID && env.CF_EMAIL_API_TOKEN && env.EMAIL_FROM)) {
    if (isDev(env)) return void console.log(`\n[email to ${to}] ${subject}\n${text}\n`);
    throw fail(503, "email_off", "Email isn't set up yet. Please use another way to sign in.");
  }
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.CF_EMAIL_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, text, html }),
  });
  if (!res.ok) {
    console.error("email send failed", res.status, await res.text());
    throw fail(502, "email_failed", "We couldn't send the email just now. Please try again in a minute.");
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/* One plain layout for every email: a heading, a line, one button, and the link spelled out. */
export function linkEmail(heading: string, line: string, button: string, url: string) {
  const text = `${heading}\n\n${line}\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f1;font-family:Arial,Helvetica,sans-serif;color:#111214">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:20px" cellpadding="0" cellspacing="0"><tr><td style="padding:32px">
<h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.5px">${esc(heading)}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#3b3d42">${esc(line)}</p>
<a href="${esc(url)}" style="display:inline-block;background:#111214;color:#fff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px">${esc(button)}</a>
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64666d">Or open this link: <br><a href="${esc(url)}" style="color:#2445ff;word-break:break-all">${esc(url)}</a></p>
<p style="margin:16px 0 0;font-size:13px;color:#64666d">If you didn't ask for this, you can ignore this email.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { text, html };
}
