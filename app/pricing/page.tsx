import type { Metadata } from "next";
import PricingScreen from "@/components/screens/PricingScreen";
import { plans } from "@/lib/billing";
import { abs, ld } from "@/lib/public";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";
import "@/app/landing-new.css";
import "@/app/public.css";

export const metadata: Metadata = {
  title: `Pricing · ${site.name}`,
  description: "Start free with 100 questions. A 1-month or 3-month plan opens the full MDCAT, NUMS and AKU question bank, timed mocks and past papers, as one payment with no automatic charges.",
  alternates: { canonical: "/pricing" },
};

/* The plans in the form search engines read, so the price can show beside the result. */
const offers = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${site.name} question bank`,
  description: "Full access to the MDCAT, NUMS and AKU question banks, timed mocks and past papers for 1 month or 3 months, as one payment with no automatic charges.",
  brand: { "@type": "Brand", name: site.name },
  image: abs("/og.png"),
  offers: [plans.season, plans.monthly].map((p) => ({
    "@type": "Offer", name: p.name, price: String(p.price), priceCurrency: "PKR", url: abs("/pricing"),
    availability: site.payments ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
  })),
};

export default function Page() {
  return (
    <>
      <PricingScreen />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(offers)} />
    </>
  );
}
