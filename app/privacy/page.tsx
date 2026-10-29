import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = { title: `Privacy · ${site.name}`, alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <LegalPage title="Privacy policy" updated="29 October 2026">
      <p>This page explains what {site.name} collects, why, and what you can ask us to do with it. We keep it short because we collect as little as we can.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Your account:</b> your name, email address and/or phone number, and your password (stored only as a one-way hash, never in readable form). If you sign in with Google, we get your name and email from Google.</li>
        <li><b>Your sign-ins:</b> the devices and browsers you sign in from and when, so you can see them on your Account page and keep your account safe.</li>
        <li><b>Your practice:</b> the tests you take, your answers, bookmarks and reports, so we can show your results, mistakes and progress.</li>
        <li><b>Payments:</b> which pass you bought, when, and the amount. Card and wallet details are handled by the payment provider; we never see or store your card number or PIN.</li>
        <li><b>Visits:</b> we count page visits without cookies and without storing your IP address. Each day&apos;s count can&apos;t be linked to the next day&apos;s or to you.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run your account, give you access to what you paid for, and show your progress.</li>
        <li>To send you messages about your account, such as sign-in codes, password resets and receipts.</li>
        <li>To fix mistakes in questions you report and to improve the bank.</li>
        <li>To keep the service and your account secure.</li>
      </ul>
      <p>We don&apos;t sell your information, and we don&apos;t show you ads from other companies.</p>

      <h2>Who else handles it</h2>
      <p>We use a small number of providers to run {site.name}: Cloudflare (hosting and database), an email or SMS provider (sign-in codes and receipts), Google (only if you choose Google sign-in) and our payment provider. They process data only to provide their service to us.</p>

      <h2>How long we keep it</h2>
      <p>We keep your account and practice history while your account is open. If you ask us to delete your account, we delete it within 30 days, except payment records we must keep by law.</p>

      <h2>Your choices</h2>
      <ul>
        <li>You can see and change your details on your Account page.</li>
        <li>You can ask for a copy of your data, or for your account to be deleted, by emailing <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</li>
      </ul>

      <h2>Children</h2>
      <p>{site.name} is for students preparing for university entrance exams. If you are under 18, please use it with a parent&apos;s or guardian&apos;s knowledge.</p>

      <h2>Changes</h2>
      <p>If we change how we use your information in a way that matters, we&apos;ll tell you before it happens.</p>
    </LegalPage>
  );
}
