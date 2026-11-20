import Shell from "@/components/public/Shell";
import Aggregate from "@/components/public/Aggregate";
import { checkedText, faqData, ld, mdcat } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../../landing-new.css";
import "../../public.css";

const w = mdcat.weights;

export const metadata = pageMeta({
  title: "MDCAT Aggregate Calculator for MBBS and BDS Merit",
  description: `Work out your MBBS or BDS aggregate from your MDCAT, FSc and matric marks with the PMDC formula: MDCAT ${w.mdcat}%, FSc ${w.hssc}%, matric ${w.ssc}%.`,
  path: "/mdcat/aggregate-calculator",
});

const faqs = [
  { q: "What is the MDCAT aggregate formula?", a: `Aggregate = (MDCAT marks ÷ MDCAT total × ${w.mdcat}) + (FSc marks ÷ FSc total × ${w.hssc}) + (matric marks ÷ matric total × ${w.ssc}). Under PMDC's admission rules for the 2026-27 session, the MDCAT counts for ${w.mdcat}%, FSc or an equivalent for ${w.hssc}% and matric or an equivalent for ${w.ssc}%.` },
  { q: "Do private medical colleges use the same formula?", a: "Yes. PMDC's rules for 2026-27 apply the same weights to public and private colleges. A university may still publish extra rules, so check its own merit policy." },
  { q: "What if I did A levels or another equivalent?", a: "Use the equivalence marks issued by IBCC as your FSc and matric marks, with the total IBCC gives." },
  { q: "What aggregate do I need for MBBS?", a: "It changes every year with the paper and the number of applicants, and it differs by province and college. Compare your aggregate with last year's closing merit of the colleges you are aiming for." },
];

export default function Calculator() {
  const trail = [{ name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" }, { name: "Aggregate calculator", href: "/mdcat/aggregate-calculator" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>MDCAT aggregate calculator</h1>
        <p className="lede">
          Your MBBS or BDS aggregate is <b>MDCAT {w.mdcat}%, FSc {w.hssc}% and matric {w.ssc}%</b>.
          Enter your marks and the calculator does the rest. Nothing you type leaves your device.
        </p>
      </header>

      <Aggregate weights={w} mdcatTotal={mdcat.mcqs} />

      <h2>How the aggregate is worked out</h2>
      <div className="prose">
        <p>Each of the three results is turned into a percentage and multiplied by its weight, then the three are added.</p>
        <p>For example, 162 out of {mdcat.mcqs} in the MDCAT, 1,080 out of 1,200 in FSc and 1,100 out of 1,200 in matric gives (162 ÷ {mdcat.mcqs} × {w.mdcat}) + (1,080 ÷ 1,200 × {w.hssc}) + (1,100 ÷ 1,200 × {w.ssc}) = 45.00 + 36.00 + 9.17 = <b>90.17%</b>.</p>
        <p>Because the MDCAT carries half the aggregate, one more correct MCQ adds about {(w.mdcat / mdcat.mcqs).toFixed(2)} to your aggregate. That is why <a href="/mdcat">chapter-wise MCQ practice</a> pays off more than anything else in the last months.</p>
      </div>

      <h2>Common questions</h2>
      <div className="pub-faq">
        {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
      <p className="note">Weights are from PMDC&apos;s admission rules for the 2026-27 session, checked on {checkedText}. Colleges announce their merit criteria each year, so confirm with the college before you rely on a number.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
    </Shell>
  );
}
