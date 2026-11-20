import ContactForm from "@/components/support/ContactForm";
import SupportFrame from "@/components/support/SupportFrame";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import { TICKET_EMAILS } from "@/lib/support";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";
import "@/app/landing-new.css";
import "@/app/public.css";

export const metadata = pageMeta({
  title: "Contact Us",
  description: `Questions about your ${site.name} account, payments or a question in the bank? Send us a message and we reply within one working day.`,
  path: "/contact",
});

export default function Page() {
  return (
    <SupportFrame>
      <h1>Contact us</h1>
      <p className="lede-sm">Questions about your account, payments or a question in the bank? Send us a message and we&apos;ll reply {TICKET_EMAILS ? "by email" : "on your ticket page"}, usually within one working day.</p>
      <ContactForm />
      <hr />
      <p className="muted small">You can also email <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
    </SupportFrame>
  );
}
