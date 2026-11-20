import type { Metadata } from "next";
import PricingScreen from "@/components/screens/PricingScreen";
import { plans } from "@/lib/billing";
import { abs, ld } from "@/lib/public";
import { site } from "@/lib/site";
import "@/app/auth.css";
import "@/app/dashboard.css";
import "@/app/app.css";

export const metadata: Metadata = {
  title: `Pricing · ${site.name}`,
  description: "Start free with 100 MDCAT questions. One Season Pass opens the full question bank, timed mocks and past papers until the exam, with no renewal.",
  alternates: { canonical: "/pricing" },
};

/* The plans in the form search engines read, so the price can show beside the result. */
const offers = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${site.name} ${plans.season.name}`,
  description: "Full access to the MDCAT, NUMS and AKU question banks, timed mocks and past papers until the exam, as one payment with no renewal.",
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
