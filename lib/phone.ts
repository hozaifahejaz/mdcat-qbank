/* Phone numbers, shared by the sign-in pages and the API.
   Pakistani mobiles in any usual form (0300 1234567, 300-1234567, 92300..., +92 300...) become +923001234567.
   Numbers typed with another country code pass through if they look like E.164. Returns null if invalid. */
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
