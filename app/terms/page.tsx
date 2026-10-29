import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Terms · ${site.name}`, alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <LegalPage title="Terms and conditions" updated="29 October 2026">
      <p>These terms apply when you use {site.name} (the website and, once released, the apps). By creating an account you agree to them. If you are under 18, a parent or guardian should read them with you.</p>

      <h2>1. What {site.name} is</h2>
      <p>{site.name} is an online question bank and mock-test service for students preparing for entrance exams in Pakistan, starting with the MDCAT. We are an independent service and are not part of, or endorsed by, PMDC or any university or exam board. We can&apos;t promise any particular score or admission result.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>One account is for one person. Don&apos;t share your password or let anyone else use your account.</li>
        <li>Give us a working email address or phone number so we can reach you about your account and payments.</li>
        <li>You&apos;re responsible for what happens on your account. Tell us straight away if you think someone else has used it.</li>
      </ul>

      <h2>3. Devices and sign-in</h2>
      <ul>
        <li>You can register up to 2 devices (for example a phone and a laptop) on your account.</li>
        <li>Only one of them can be signed in at a time. Signing in on one signs the other out.</li>
        <li>You can remove a registered device yourself once every 30 days from your Account page. If you lose a device or need help sooner, contact support.</li>
      </ul>

      <h2>4. Passes and payment</h2>
      <ul>
        <li>The free plan gives limited access. A paid pass unlocks the full bank, mocks and past papers for the period shown when you buy it: the Season Pass until the end of the current MDCAT season, or the one-month pass for 30 days.</li>
        <li>Passes are one-off payments. Nothing renews automatically and we never charge you again without you buying again.</li>
        <li>Prices are in Pakistani rupees and are shown before you pay. Refunds follow our <a href="/refunds">Refund policy</a>.</li>
      </ul>

      <h2>5. Our content</h2>
      <p>The questions, explanations, mocks and everything else on {site.name} are written for us and belong to us. Your pass lets you use them for your own study only. You may not:</p>
      <ul>
        <li>copy, screenshot, record, download or share questions or explanations with others, whether free or paid;</li>
        <li>sell, publish or upload our content anywhere, including groups, channels, websites or other apps;</li>
        <li>use bots, scripts or other automated tools to read or collect content from the site.</li>
      </ul>

      <h2>6. Fair use and suspension</h2>
      <p>If an account breaks these terms, for example by sharing content or the account itself, we may suspend or close it. Where we close an account for a breach, no refund is due. If you think we got it wrong, write to us and we&apos;ll look at it again.</p>

      <h2>7. Mistakes in questions</h2>
      <p>Every question is checked before it goes live, but if you find a mistake please report it from the question screen. We review every report.</p>

      <h2>8. Changes</h2>
      <p>We may update these terms as the service grows. If a change matters, we&apos;ll tell you by email or on the site before it takes effect. Using {site.name} after that means you accept the new terms.</p>

      <h2>9. Law</h2>
      <p>These terms are governed by the laws of Pakistan.</p>
    </LegalPage>
  );
}
