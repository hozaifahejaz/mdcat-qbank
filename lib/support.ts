/* Support tickets, shared by the contact page, the admin panel and the API (server/support.ts). */

export const topics = [
  { id: "account", label: "My account or signing in" },
  { id: "payment", label: "Payments and plans" },
  { id: "question", label: "A question in the bank" },
  { id: "feedback", label: "An idea or feedback" },
  { id: "other", label: "Something else" },
] as const;
export type TopicId = (typeof topics)[number]["id"];
export const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? "Something else";
export const isTopic = (v: unknown): v is TopicId => topics.some((t) => t.id === v);

/* Email for tickets. Off for now, so the month's free sends are kept for sign-up and password emails: tickets only
   show in the admin panel, and answers only on the person's ticket page. Set to true to email answers to the person
   (from the support address) and to tell the support inbox about new tickets and follow-ups. */
export const TICKET_EMAILS = false;

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;

export type TicketStatus = "open" | "closed";
export type TicketMessage = { id: number; fromStaff: boolean; author: string; body: string; createdAt: number };

/* A ticket as its writer sees it on the private ticket page. */
export type PublicTicket = { id: number; name: string; topic: string; status: TicketStatus; createdAt: number; messages: TicketMessage[] };

/* A ticket in the admin list. */
export type TicketRow = {
  id: number; name: string; email: string; topic: string; status: TicketStatus; lastFrom: "person" | "staff";
  createdAt: number; updatedAt: number; messages: number; preview: string; userId: string | null;
};
export type TicketDetail = {
  ticket: TicketRow;
  messages: TicketMessage[];
  /* The account it came from, or the account with the same email. */
  account: { id: string; name: string; plan: string; planExpiresAt: number | null; createdAt: number; linked: boolean } | null;
  others: { id: number; topic: string; status: TicketStatus; createdAt: number }[];
};
