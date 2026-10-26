import { supabase } from "@/lib/supabase";
import { deviceLabel, getDeviceKey } from "@/lib/device";

export type Device = { id: string; label: string; created_at: string; last_seen_at: string; active: boolean };

export type ClaimResult =
  | { status: "active"; takeovers_today: number }
  | { status: "device_limit"; devices: Device[] };

export type CheckResult =
  | { status: "active" }
  | { status: "idle" }
  | { status: "locked"; active_label: string | null };

export type RemoveResult =
  | { status: "removed"; devices: Device[] }
  | { status: "swap_limit"; next_allowed_at: string }
  | { status: "not_found" };

/* Where to go after signing in. Only paths on this site, so ?next= can't send anyone elsewhere. */
export const HOME_AFTER_SIGN_IN = "/dashboard";

export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return HOME_AFTER_SIGN_IN;
  return raw;
}

export function readNext(): string {
  return safeNext(new URLSearchParams(window.location.search).get("next"));
}

/* Pakistani mobiles in any usual form (0300 1234567, 300-1234567, 92300..., +92 300...) become +923001234567.
   Numbers typed with another country code are passed through if they look like E.164. Returns null if invalid. */
export function normalisePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && !digits.startsWith("92")) {
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }
  let local = digits;
  if (local.startsWith("0092")) local = local.slice(4);
  else if (local.startsWith("92") && local.length === 12) local = local.slice(2);
  else if (local.startsWith("0")) local = local.slice(1);
  return /^3\d{9}$/.test(local) ? `+92${local}` : null;
}

export function formatPhone(e164: string): string {
  const m = /^\+92(3\d{2})(\d{7})$/.exec(e164);
  return m ? `+92 ${m[1]} ${m[2]}` : e164;
}

/* Supabase's error text, in words a student can act on. */
export function friendlyError(err: { message?: string; code?: string; status?: number } | null | undefined): string {
  if (!err) return "Something went wrong. Please try again.";
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) return "That email and password don't match. Check them, or reset your password.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) return "Please confirm your email first. We sent you a link when you signed up.";
  if (code === "user_already_exists" || msg.includes("already registered")) return "An account with this email already exists. Sign in instead.";
  if (code === "weak_password" || msg.includes("password should")) return "Choose a stronger password: at least 8 characters, with letters and numbers.";
  if (code === "otp_expired" || msg.includes("expired") || msg.includes("invalid otp") || msg.includes("token has expired")) return "That code is wrong or has expired. Request a new one.";
  if (code === "over_sms_send_rate_limit" || code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || err.status === 429) return "Too many tries. Please wait a minute and try again.";
  if (code === "captcha_failed" || msg.includes("captcha")) return "Please complete the check above and try again.";
  if (code === "sms_send_failed" || msg.includes("sms")) return "We couldn't send an SMS to that number. Check it and try again.";
  if (code === "phone_provider_disabled" || code === "provider_disabled" || msg.includes("provider is not enabled")) return "This sign-in option isn't switched on yet. Please use another one.";
  if (code === "signup_disabled") return "New sign-ups are paused right now.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "You seem to be offline. Check your connection and try again.";
  return err.message || "Something went wrong. Please try again.";
}

/* The device rule, server side (supabase/migrations). Signing in on a device makes it the active one. */
export async function claimDevice(): Promise<ClaimResult> {
  const { data, error } = await supabase!.rpc("claim_device", { p_device_key: getDeviceKey(), p_label: deviceLabel() });
  if (error) throw error;
  return data as ClaimResult;
}

export async function checkDevice(): Promise<CheckResult> {
  const { data, error } = await supabase!.rpc("check_device", { p_device_key: getDeviceKey() });
  if (error) throw error;
  return data as CheckResult;
}

export async function removeDevice(id: string): Promise<RemoveResult> {
  const { data, error } = await supabase!.rpc("remove_device", { p_device_id: id });
  if (error) throw error;
  return data as RemoveResult;
}

export async function myDevices(): Promise<Device[]> {
  const { data, error } = await supabase!.rpc("my_devices");
  if (error) throw error;
  return (data ?? []) as Device[];
}

/* Free the active slot, then end this session only (other devices stay signed in, just locked). */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  try { await supabase.rpc("release_device"); } catch {}
  await supabase.auth.signOut({ scope: "local" });
}
