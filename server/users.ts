import { uuid } from "./crypto";
import type { OAuthProfile, Provider } from "./oauth";
import { LEGACY, cleanExams } from "../lib/exams";

export type UserRow = {
  id: string; name: string; email: string | null; email_verified_at: number | null; phone: string | null;
  password_hash: string | null; plan: string; plan_expires_at: number | null; role: string;
  /* The area and exams the account chose (lib/exams.ts). Missing altogether when the columns couldn't be read. */
  area?: string | null; exams?: string | null;
};

const BASE_COLUMNS = "id, name, email, email_verified_at, phone, password_hash, plan, plan_expires_at, role";

/* The area and exams columns arrive with migration 0064. The site is deployed whether or not a migration went
   through, so if they turn out not to be there, every query that names them is run again without them, and they are
   left out for the next minute. An account read that way counts as it did before exams were chosen. */
let plainUntil = 0;
const withExams = () => Date.now() >= plainUntil;
export const userColumns = () => (withExams() ? `${BASE_COLUMNS}, area, exams` : BASE_COLUMNS);
/* The same two columns for a query that joins users under another name (the session lookup). */
export const examColumns = (prefix = "") => (withExams() ? `, ${prefix}area, ${prefix}exams` : "");
export async function tolerant<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (!withExams() || !/no such column/i.test(String((e as Error)?.message ?? e))) throw e;
    plainUntil = Date.now() + 60_000;
    return run();
  }
}

const userBy = (db: D1Database, column: "id" | "email" | "phone", value: string) =>
  tolerant(() => db.prepare(`SELECT ${userColumns()} FROM users WHERE ${column} = ?`).bind(value).first<UserRow>());
export const userById = (db: D1Database, id: string) => userBy(db, "id", id);
export const userByEmail = (db: D1Database, email: string) => userBy(db, "email", email);
export const userByPhone = (db: D1Database, phone: string) => userBy(db, "phone", phone);

/* An account's area and exams as a list. An account read without the columns keeps what every account had before
   (all of pre-medical); one that has not chosen yet has no area and no exams. */
export function chosen(u: { area?: string | null; exams?: string | null }): { area: string | null; exams: string[] } {
  if (u.area === undefined) return { area: LEGACY.area, exams: [...LEGACY.exams] };
  const exams = cleanExams(u.area, u.exams);
  return exams.length ? { area: u.area, exams } : { area: null, exams: [] };
}

export async function createUser(db: D1Database, fields: { name?: string; email?: string | null; emailVerified?: boolean; phone?: string | null; passwordHash?: string | null }): Promise<string> {
  const id = uuid();
  const now = Date.now();
  await db
    .prepare("INSERT INTO users (id, name, email, email_verified_at, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, fields.name ?? "", fields.email ?? null, fields.emailVerified ? now : null, fields.phone ?? null, fields.passwordHash ?? null, now)
    .run();
  return id;
}

/* Who a Google or Apple sign-in belongs to: the linked account, else the account with the same verified email,
   else a new one. If that email belongs to an account nobody has confirmed yet, its password is dropped before
   linking, so someone who signed up with another person's address can't keep a way in. */
export async function userForOAuth(db: D1Database, provider: Provider, p: OAuthProfile): Promise<string> {
  const linked = await db.prepare("SELECT user_id FROM identities WHERE provider = ? AND subject = ?").bind(provider, p.subject).first<{ user_id: string }>();
  if (linked) return linked.user_id;

  const now = Date.now();
  let userId: string | null = null;
  if (p.email && p.emailVerified) {
    const existing = await userByEmail(db, p.email);
    if (existing) {
      userId = existing.id;
      // An account nobody confirmed may have been made by someone else: end whatever sessions it has.
      if (!existing.email_verified_at) {
        await db.batch([
          db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
          db.prepare("UPDATE users SET active_session_id = NULL, active_device_id = NULL WHERE id = ?").bind(userId),
        ]);
      }
      await db
        .prepare(
          `UPDATE users SET
             password_hash = CASE WHEN email_verified_at IS NULL THEN NULL ELSE password_hash END,
             email_verified_at = coalesce(email_verified_at, ?),
             name = CASE WHEN name = '' THEN ? ELSE name END
           WHERE id = ?`,
        )
        .bind(now, p.name, userId)
        .run();
    }
  }
  if (!userId) {
    const emailFree = p.email && p.emailVerified && !(await userByEmail(db, p.email));
    userId = await createUser(db, { name: p.name, email: emailFree ? p.email : null, emailVerified: Boolean(emailFree) });
  }
  await db.prepare("INSERT INTO identities (provider, subject, user_id, email, created_at) VALUES (?, ?, ?, ?, ?)").bind(provider, p.subject, userId, p.email, now).run();
  return userId;
}

/* Admin accounts always have everything, with no end date, whatever the plan column says. */
export const hasLifetimeAccess = (u: Pick<UserRow, "role">) => u.role === "admin";

/* The plan in force now: a paid plan whose end date has passed counts as free. */
export const effectivePlan = (u: Pick<UserRow, "plan" | "plan_expires_at" | "role">, now = Date.now()) =>
  hasLifetimeAccess(u) ? "bundle" :
  u.plan !== "free" && (u.plan_expires_at === null || u.plan_expires_at > now) ? u.plan : "free";

/* The account as the pages see it (matches StudentUser in lib/user.ts, plus sign-in methods). */
export async function publicUser(db: D1Database, u: UserRow, linked?: { provider: string }[]) {
  const results = linked ?? (await db.prepare("SELECT provider FROM identities WHERE user_id = ?").bind(u.id).all<{ provider: string }>()).results;
  const methods = [
    ...(u.password_hash ? ["email"] : []),
    ...(u.phone ? ["phone"] : []),
    ...new Set(results.map((r) => r.provider)),
  ];
  return {
    id: u.id,
    name: u.name,
    email: u.email ?? undefined,
    phone: u.phone ?? undefined,
    plan: effectivePlan(u),
    role: u.role,
    planExpiresAt: u.plan_expires_at && !hasLifetimeAccess(u) && effectivePlan(u) !== "free" ? new Date(u.plan_expires_at).toISOString() : undefined,
    methods,
    ...chosen(u),
  };
}

/* The same, read in one trip to the database. Null when the account is gone. */
export async function publicUserById(db: D1Database, id: string) {
  const [user, linked] = await tolerant(() => db.batch([
    db.prepare(`SELECT ${userColumns()} FROM users WHERE id = ?`).bind(id),
    db.prepare("SELECT provider FROM identities WHERE user_id = ?").bind(id),
  ]));
  const u = user!.results[0] as UserRow | undefined;
  return u ? publicUser(db, u, linked!.results as { provider: string }[]) : null;
}
