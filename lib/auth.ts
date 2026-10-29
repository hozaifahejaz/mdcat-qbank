import { ApiError, api } from "@/lib/api";
import { deviceLabel, getDeviceKey } from "@/lib/device";
export { formatPhone, normalisePhone } from "@/lib/phone";

export type Device = { id: string; label: string; created_at: number; last_seen_at: number; active: boolean };

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

/* The API already words its errors for students; anything else gets a generic line. */
export function friendlyError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}

/* The ?error= codes Google and Apple sign-in can send back to /signin. Anything else shows the generic line. */
export const signInErrors: Record<string, string> = {
  provider_off: "That sign-in method isn't switched on yet. Please use your email for now.",
  oauth_cancelled: "Sign-in was cancelled. Please try again.",
  oauth_state: "That sign-in link expired. Please try again.",
};
export const signInError = (code: string) => signInErrors[code] ?? "Sign-in didn't complete. Please try again.";

/* The device rule, enforced by the API (server/devices.ts). Signing in on a device makes it the active one. */
export const claimDevice = () => api<ClaimResult>("/api/device/claim", { body: { deviceKey: getDeviceKey(), label: deviceLabel() } });
export const checkDevice = () => api<CheckResult>("/api/device/check", { body: { deviceKey: getDeviceKey() } });
export const removeDevice = (id: string) => api<RemoveResult>("/api/device/remove", { body: { id } });
export const myDevices = () => api<Device[]>("/api/device/list");

/* Frees the active slot and ends this browser's session; the other device stays signed in. */
export async function signOut(): Promise<void> {
  try { await api("/api/auth/signout", { body: {} }); } catch {}
}
