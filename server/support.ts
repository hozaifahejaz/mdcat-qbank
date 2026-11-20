import { MESSAGE_MAX, MESSAGE_MIN, type PublicTicket, type TicketDetail, type TicketMessage, type TicketRow, type TicketStatus, isTopic, topicLabel } from "../lib/support";
import { site } from "../lib/site";
import { randomToken } from "./crypto";
import type { Env } from "./env";
import { body, fail, json, str } from "./http";
import { type Sender, messageEmail, sendMail } from "./mail";
import { rateLimit } from "./ratelimit";
import { getSession } from "./session";
import { checkCaptcha } from "./turnstile";
import { requireRole } from "./admin";

/* Support tickets. Anyone can write in from /contact; each message starts a ticket, with a private link (shown
   after sending, and in every answer) where they can read the conversation and add to it. Admins answer from /admin/tickets, and each answer is
   emailed from the support address. Every message, both ways, is kept in ticket_messages. */

type Ctx = { env: Env; request: Request; db: D1Database; ip: string; origin: string };

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEAM = `${site.name} Support`;

const support = (env: Env): Sender => ({ address: env.SUPPORT_EMAIL ?? site.supportEmail, name: TEAM });
const subjectOf = (id: number) => `Your ${site.name} support ticket #${id}`;
const ticketUrl = (origin: string, token: string) => `${origin}/contact/ticket?t=${encodeURIComponent(token)}`;

function message(v: unknown): string {
  // Keep line breaks, drop other control characters, and trim runs of blank lines.
  const m = (typeof v === "string" ? v : "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (m.length < MESSAGE_MIN) throw fail(400, "short_message", "Please write a little more so we can help.");
  if (m.length > MESSAGE_MAX) throw fail(400, "long_message", `Please keep it under ${MESSAGE_MAX.toLocaleString("en")} characters.`);
  return m;
}

type Row = {
  id: number; name: string; email: string; topic: string; status: TicketStatus; last_from: "person" | "staff";
  created_at: number; updated_at: number; user_id: string | null; token: string;
};
type MsgRow = { id: number; from_staff: number; body: string; created_at: number; author: string | null };

const MSG_SELECT = "SELECT m.id, m.from_staff, m.body, m.created_at, a.name AS author FROM ticket_messages m LEFT JOIN users a ON a.id = m.author_id WHERE m.ticket_id = ? ORDER BY m.id";

/* The person sees the team's name on staff messages, not the staff member's own. */
const forPerson = (r: MsgRow, name: string): TicketMessage => ({ id: r.id, fromStaff: !!r.from_staff, author: r.from_staff ? TEAM : name, body: r.body, createdAt: r.created_at });
const forStaff = (r: MsgRow, name: string): TicketMessage => ({ id: r.id, fromStaff: !!r.from_staff, author: r.from_staff ? r.author || TEAM : name, body: r.body, createdAt: r.created_at });

/* The ticket a request points at: by its private link (?t=), or by number for the signed-in account that wrote it. */
async function ownTicket(c: Ctx, t: unknown, id: unknown): Promise<Row> {
  let row: Row | null = null;
  if (typeof t === "string" && t) {
    row = await c.db.prepare("SELECT * FROM tickets WHERE token = ?").bind(str(t, 200)).first<Row>();
  } else if (id) {
    const s = await getSession(c.db, c.request);
    if (s) row = await c.db.prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?").bind(Number(id) || 0, s.user_id).first<Row>();
  }
  if (!row) throw fail(404, "not_found", "We couldn't find that ticket. Open the link from your email again.");
  return row;
}

/* Tells the support inbox about a new message, so it shows up in Gmail too. Best effort: the ticket is saved either way. */
async function tellInbox(c: Ctx, t: { id: number; name: string; email: string; topic: string }, text: string, isNew: boolean) {
  const url = `${c.origin}/admin/tickets?id=${t.id}`;
  const heading = `${isNew ? "New ticket" : "New reply on ticket"} #${t.id} from ${t.name}`;
  const m = messageEmail(heading, `${topicLabel(t.topic)} · ${t.email}\n\n${text}`, "Open in the admin panel", url, "Answer from the admin panel so the whole conversation stays in one place.");
  await sendMail(c.env, support(c.env).address, `${heading} · ${topicLabel(t.topic)}`, m.text, m.html).catch((e) => console.error("support inbox email failed", e));
}

const publicRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* A new ticket from the contact page. Signed-out visitors pass the same check as sign-up, and everyone is limited
     per address and per email. */
  "POST /api/support": async (c) => {
    const b = await body(c.request);
    // A field people never see; anything filled in there came from a script. It gets the same answer as everyone.
    if (str(b.website, 200)) return json({ ok: true, id: 0 });
    const s = await getSession(c.db, c.request);
    if (!s) await checkCaptcha(c.env, b.captcha, c.ip);
    const name = str(b.name, 80).replace(/\s+/g, " ");
    if (name.length < 2) throw fail(400, "bad_name", "Please enter your name.");
    const email = str(b.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) throw fail(400, "bad_email", "Please enter a valid email address, so we can reply.");
    const topic = isTopic(b.topic) ? b.topic : "other";
    const text = message(b.message);
    await rateLimit(c.db, `support:ip:${c.ip}`, 6, HOUR);
    await rateLimit(c.db, `support:email:${email}`, 6, DAY);

    const token = randomToken();
    const now = Date.now();
    const made = await c.db
      .prepare("INSERT INTO tickets (name, email, topic, user_id, token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id")
      .bind(name, email, topic, s?.user_id ?? null, token, now, now)
      .first<{ id: number }>();
    const id = made!.id;
    await c.db.prepare("INSERT INTO ticket_messages (ticket_id, from_staff, author_id, body, created_at) VALUES (?, 0, ?, ?, ?)").bind(id, s?.user_id ?? null, text, now).run();

    // No receipt email to the sender (it would cost a send for every ticket): the page shows the ticket link instead,
    // and the first answer emails it to them.
    await tellInbox(c, { id, name, email, topic }, text, true);
    return json({ ok: true, id, link: `/contact/ticket?t=${encodeURIComponent(token)}` });
  },

  /* One ticket and its conversation, for the person who wrote it. */
  "GET /api/support/ticket": async (c) => {
    const p = new URL(c.request.url).searchParams;
    const t = await ownTicket(c, p.get("t"), p.get("id"));
    const { results } = await c.db.prepare(MSG_SELECT).bind(t.id).all<MsgRow>();
    const out: PublicTicket = { id: t.id, name: t.name, topic: t.topic, status: t.status, createdAt: t.created_at, messages: results.map((r) => forPerson(r, t.name)) };
    return json({ ticket: out });
  },

  /* The person adds to their ticket. A closed ticket opens again. */
  "POST /api/support/ticket/reply": async (c) => {
    const b = await body(c.request);
    const t = await ownTicket(c, b.t, b.id);
    const text = message(b.message);
    await rateLimit(c.db, `support:reply:${t.id}`, 10, HOUR);
    const now = Date.now();
    const s = await getSession(c.db, c.request);
    await c.db.batch([
      c.db.prepare("INSERT INTO ticket_messages (ticket_id, from_staff, author_id, body, created_at) VALUES (?, 0, ?, ?, ?)").bind(t.id, s?.user_id ?? null, text, now),
      c.db.prepare("UPDATE tickets SET status = 'open', last_from = 'person', updated_at = ? WHERE id = ?").bind(now, t.id),
    ]);
    await tellInbox(c, t, text, false);
    return json({ ok: true });
  },

  /* The signed-in account's own tickets, for the contact page. */
  "GET /api/support/mine": async (c) => {
    const s = await getSession(c.db, c.request);
    if (!s) return json({ tickets: [] });
    const { results } = await c.db
      .prepare("SELECT id, topic, status, last_from, created_at, updated_at FROM tickets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20")
      .bind(s.user_id)
      .all<{ id: number; topic: string; status: TicketStatus; last_from: string; created_at: number; updated_at: number }>();
    return json({ tickets: results.map((r) => ({ id: r.id, topic: r.topic, status: r.status, answered: r.last_from === "staff", createdAt: r.created_at, updatedAt: r.updated_at })) });
  },
};

/* ---------- Admin ---------- */

const admin = (c: Ctx) => requireRole(c, ["admin"]);
const log = (db: D1Database, actorId: string, action: string, id: number, detail = "") =>
  db.prepare("INSERT INTO admin_log (actor_id, action, target, detail, created_at) VALUES (?, ?, ?, ?, ?)").bind(actorId, action, `#${id}`, detail, Date.now());

type ListRow = Row & { messages: number; preview: string | null };
const toRow = (r: ListRow): TicketRow => ({
  id: r.id, name: r.name, email: r.email, topic: r.topic, status: r.status, lastFrom: r.last_from,
  createdAt: r.created_at, updatedAt: r.updated_at, messages: r.messages, preview: (r.preview ?? "").slice(0, 160), userId: r.user_id,
});
const LIST_SELECT = `SELECT t.*, (SELECT count(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS messages,
  (SELECT body FROM ticket_messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS preview FROM tickets t`;

async function getRow(db: D1Database, id: number): Promise<ListRow> {
  const r = await db.prepare(`${LIST_SELECT} WHERE t.id = ?`).bind(id).first<ListRow>();
  if (!r) throw fail(404, "not_found", "That ticket doesn't exist.");
  return r;
}

const adminRoutes: Record<string, (c: Ctx) => Promise<Response>> = {
  /* Tickets by status, newest activity first, with the counts for the tabs. "waiting" is open tickets whose last
     message is from the person, so they still need an answer. */
  "GET /api/admin/tickets": async (c) => {
    await admin(c);
    const p = new URL(c.request.url).searchParams;
    const view = p.get("view") ?? "waiting";
    const q = str(p.get("q"), 100);
    const where: string[] = [];
    const args: unknown[] = [];
    if (view === "waiting") where.push("t.status = 'open' AND t.last_from = 'person'");
    else if (view === "open") where.push("t.status = 'open'");
    else if (view === "closed") where.push("t.status = 'closed'");
    if (q) {
      const n = Number(q.replace(/^#/, ""));
      where.push("(t.name LIKE ?1 OR t.email LIKE ?1 OR t.id = ?2)");
      args.push(`%${q}%`, Number.isInteger(n) ? n : -1);
    }
    const [list, counts] = await c.db.batch([
      c.db.prepare(`${LIST_SELECT}${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY t.updated_at DESC LIMIT 200`).bind(...args),
      c.db.prepare("SELECT sum(status = 'open' AND last_from = 'person') AS waiting, sum(status = 'open') AS open, sum(status = 'closed') AS closed, count(*) AS all_ FROM tickets"),
    ]);
    const n = counts!.results[0] as { waiting: number | null; open: number | null; closed: number | null; all_: number };
    return json({ tickets: (list!.results as ListRow[]).map(toRow), counts: { waiting: n.waiting ?? 0, open: n.open ?? 0, closed: n.closed ?? 0, all: n.all_ } });
  },

  "GET /api/admin/tickets/one": async (c) => {
    await admin(c);
    const id = Number(new URL(c.request.url).searchParams.get("id")) || 0;
    const t = await getRow(c.db, id);
    const [msgs, acct, others] = await c.db.batch([
      c.db.prepare(MSG_SELECT).bind(id),
      // The account it was sent from, else an account with the same email.
      c.db.prepare("SELECT id, name, plan, plan_expires_at, created_at, id = ?1 AS linked FROM users WHERE id = ?1 OR email = ?2 ORDER BY id = ?1 DESC LIMIT 1").bind(t.user_id ?? "", t.email),
      c.db.prepare("SELECT id, topic, status, created_at FROM tickets WHERE email = ? AND id != ? ORDER BY id DESC LIMIT 10").bind(t.email, id),
    ]);
    const a = acct!.results[0] as { id: string; name: string; plan: string; plan_expires_at: number | null; created_at: number; linked: number } | undefined;
    const out: TicketDetail = {
      ticket: toRow(t),
      messages: (msgs!.results as MsgRow[]).map((r) => forStaff(r, t.name)),
      account: a ? { id: a.id, name: a.name, plan: a.plan, planExpiresAt: a.plan_expires_at, createdAt: a.created_at, linked: !!a.linked } : null,
      others: (others!.results as { id: number; topic: string; status: TicketStatus; created_at: number }[]).map((o) => ({ id: o.id, topic: o.topic, status: o.status, createdAt: o.created_at })),
    };
    return json(out);
  },

  /* An answer: emailed to the person from the support address first, and kept only once it has gone. */
  "POST /api/admin/tickets/reply": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const id = Number(b.id) || 0;
    const t = await getRow(c.db, id);
    const text = message(b.message);
    const close = b.close === true;
    const m = messageEmail(
      `Re: ${topicLabel(t.topic)} (ticket #${id})`,
      `Hi ${t.name.split(" ")[0]},\n\n${text}`,
      "See the whole conversation", ticketUrl(c.origin, t.token),
      close ? "We've marked this ticket as solved. If you still need help, reply from the link above and it opens again." : "To answer, reply from the link above.",
    );
    await sendMail(c.env, t.email, subjectOf(id), m.text, m.html, { from: support(c.env), replyTo: support(c.env).address });
    const now = Date.now();
    await c.db.batch([
      c.db.prepare("INSERT INTO ticket_messages (ticket_id, from_staff, author_id, body, created_at) VALUES (?, 1, ?, ?, ?)").bind(id, me.id, text, now),
      c.db.prepare("UPDATE tickets SET status = ?, last_from = 'staff', updated_at = ? WHERE id = ?").bind(close ? "closed" : "open", now, id),
      log(c.db, me.id, close ? "ticket.reply_close" : "ticket.reply", id, t.email),
    ]);
    return json({ ok: true });
  },

  "POST /api/admin/tickets/status": async (c) => {
    const me = await admin(c);
    const b = await body(c.request);
    const id = Number(b.id) || 0;
    if (b.status !== "open" && b.status !== "closed") throw fail(400, "bad_status", "Pick open or closed.");
    await getRow(c.db, id);
    await c.db.batch([
      c.db.prepare("UPDATE tickets SET status = ? WHERE id = ?").bind(b.status, id),
      log(c.db, me.id, b.status === "closed" ? "ticket.close" : "ticket.reopen", id),
    ]);
    return json({ ok: true });
  },

  /* For spam. Real tickets are closed, not deleted. */
  "POST /api/admin/tickets/delete": async (c) => {
    const me = await admin(c);
    const id = Number((await body(c.request)).id) || 0;
    const t = await getRow(c.db, id);
    await c.db.batch([
      c.db.prepare("DELETE FROM ticket_messages WHERE ticket_id = ?").bind(id),
      c.db.prepare("DELETE FROM tickets WHERE id = ?").bind(id),
      log(c.db, me.id, "ticket.delete", id, t.email),
    ]);
    return json({ ok: true });
  },
};

export const supportRoutes = { ...publicRoutes, ...adminRoutes };
