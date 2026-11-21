/* Plans, prices and payments as the pricing, checkout and billing screens see them. Prices come from lib/site.ts.
   Payments aren't open yet: there is no charge call and no receipts until the aggregator (Safepay, PayFast or
   Simpaisa) is connected. */
import { prices } from "@/lib/site";
import type { StudentUser } from "@/lib/user";

/* "season" is the 3-month plan. The id is the one the accounts table has always used for the longer plan. */
export type PlanId = Exclude<StudentUser["plan"], "free" | "bundle">;
export type Method = "jazzcash" | "easypaisa" | "card" | "transfer";

const rs = (s: string) => Number(s.replace(/,/g, ""));
export const money = (n: number) => `Rs. ${n.toLocaleString("en-GB")}`;

export const renewOff = prices.renewOff;
/* What a plan costs when it's a renewal, to the rupee below (Rs. 1,999 -> Rs. 1,499). */
export const renewPrice = (price: number) => Math.floor(price * (100 - renewOff) / 100);
/* A student renews when they already hold a paid plan. */
export const isRenewal = (plan: StudentUser["plan"]) => plan === "season" || plan === "monthly";

export const plans: Record<PlanId, { name: string; short: string; price: number; days: number; per: string; blurb: string }> = {
  season: { name: "3 months", short: "3 months", price: rs(prices.three), days: 90, per: "for 90 days", blurb: `One payment for 90 days, with no automatic charges. Renew for ${renewOff}% less` },
  monthly: { name: "1 month", short: "1 month", price: rs(prices.monthly), days: 30, per: "for 30 days", blurb: `One payment for 30 days, with no automatic charges. Renew for ${renewOff}% less` },
};

/* What the free plan gives, in the same words everywhere. */
export const freeItems = ["100 free questions", "One mini mock", "Every answer explained"];
export const paidItems = ["The full question bank, every chapter", "MDCAT, NUMS and AKU banks", "Full-length timed mocks", "Past papers", "My mistakes and bookmarks"];

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
