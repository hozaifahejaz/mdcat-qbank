import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";
import "@/app/landing-new.css";
import "@/app/public.css";

export const metadata: Metadata = { title: `Refunds · ${site.name}`, description: "When and how Markhor Prep refunds a paid plan.", alternates: { canonical: "/refunds" } };

export default function Page() {
  return (
    <LegalPage title="Refund policy" updated="21 November 2026">
      <p>We want you to be sure before you pay, which is why there is a free plan to try {site.name} first. If a paid plan still isn&apos;t right for you, here is when you can get your money back.</p>

      <h2>When you can get a refund</h2>
      <ul>
        <li><b>Within 7 days:</b> a full refund if you ask within 7 days of paying and have opened fewer than 100 questions since paying.</li>
        <li><b>Paid twice:</b> if you were charged twice for the same plan, we refund the extra payment in full.</li>
        <li><b>Paid but no access:</b> if your payment went through but your plan didn&apos;t unlock and we can&apos;t fix it, we refund you in full.</li>
      </ul>

      <h2>When we can&apos;t refund</h2>
      <ul>
        <li>After 7 days, or once you&apos;ve opened 100 or more questions since paying.</li>
        <li>If the account was closed for breaking our <a href="/terms">Terms</a>, such as sharing content or the account.</li>
      </ul>

      <h2>How to ask</h2>
      <p>Email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from the email on your account with the date you paid and how you paid. We reply within 2 working days.</p>
      <p>Approved refunds go back the way you paid (JazzCash, Easypaisa, card or bank) within 14 working days. Your plan ends when the refund is made.</p>
    </LegalPage>
  );
}
