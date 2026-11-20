import type { Metadata } from "next";
import SupportFrame from "@/components/support/SupportFrame";
import TicketView from "@/components/support/TicketView";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";
import "@/app/landing-new.css";
import "@/app/public.css";

/* A private page: the ticket comes from the link in the email, so search engines are kept out. */
export const metadata: Metadata = { title: `Your support ticket · ${site.name}`, robots: { index: false, follow: false } };

export default function Page() {
  return (
    <SupportFrame>
      <TicketView />
    </SupportFrame>
  );
}
