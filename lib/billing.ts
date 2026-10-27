/* Plans, prices and payments as the checkout and billing screens see them. Prices come from lib/site.ts (the plan's
   pricing table). Payments aren't open yet: there is no charge call and no receipts until the aggregator
   (Safepay, PayFast or Simpaisa) is connected. */
import { prices } from "@/lib/site";
import type { StudentUser } from "@/lib/user";

export type PlanId = Exclude<StudentUser["plan"], "free" | "bundle">;
export type Method = "jazzcash" | "easypaisa" | "card" | "transfer";

const rs = (s: string) => Number(s.replace(/,/g, ""));
export const money = (n: number) => `Rs. ${n.toLocaleString("en-GB")}`;

/* Early-bird price until 1 March 2027 (the plan's "before March"). */
export const earlyBirdEnds = "2027-03-01T00:00:00+05:00";
export const isEarlyBird = (now = Date.now()) => now < new Date(earlyBirdEnds).getTime();

export const plans: Record<PlanId, { name: string; price: number; was?: number; per: string; blurb: string }> = {
  season: {
    name: "MDCAT Season Pass",
    price: isEarlyBird() ? rs(prices.earlyBird) : rs(prices.seasonPass),
    was: isEarlyBird() ? rs(prices.seasonPass) : undefined,
    per: "until the exam",
    blurb: "One payment, no renewal",
  },
  monthly: { name: "Monthly", price: rs(prices.monthly), per: "a month", blurb: "Cancel any time" },
};

export const methodNames: Record<Method, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Debit or credit card",
  transfer: "Bank transfer or Raast",
};

export type Receipt = { id: string; date: string; item: string; method: Method; amount: number; status: "paid" | "pending" | "refunded" };

export async function getReceipts(_user: StudentUser): Promise<Receipt[]> {
  return [];
}
