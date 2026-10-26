import { uuid } from "./crypto";
import type { OAuthProfile, Provider } from "./oauth";

export type UserRow = {
  id: string; name: string; email: string | null; email_verified_at: number | null; phone: string | null;
  password_hash: string | null; plan: string; plan_expires_at: number | null;
};

const COLUMNS = "id, name, email, email_verified_at, phone, password_hash, plan, plan_expires_at";

export const userById = (db: D1Database, id: string) => db.prepare(`SELECT ${COLUMNS} FROM users WHERE id = ?`).bind(id).first<UserRow>();
export const userByEmail = (db: D1Database, email: string) => db.prepare(`SELECT ${COLUMNS} FROM users WHERE email = ?`).bind(email).first<UserRow>();
export const userByPhone = (db: D1Database, phone: string) => db.prepare(`SELECT ${COLUMNS} FROM users WHERE phone = ?`).bind(phone).first<UserRow>();

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

/* The account as the pages see it (matches StudentUser in lib/user.ts, plus sign-in methods). */
export async function publicUser(db: D1Database, u: UserRow) {
  const { results } = await db.prepare("SELECT provider FROM identities WHERE user_id = ?").bind(u.id).all<{ provider: string }>();
  const methods = [
    ...(u.password_hash ? ["email"] : []),
    ...(u.phone ? ["phone"] : []),
    ...new Set(results.map((r) => r.provider)),
  ];
  return {
    id: u.id,
    name: u.name,
    email: u.email && u.email_verified_at ? u.email : undefined,
    phone: u.phone ?? undefined,
    plan: u.plan,
    planExpiresAt: u.plan_expires_at ? new Date(u.plan_expires_at).toISOString() : undefined,
    methods,
  };
}
