import { PubMark } from "@/components/public/Mark";
import Shell from "@/components/public/Shell";
import { bankById } from "@/lib/banks";
import { checkedText, data, faqData, ld, round } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../public.css";

const bank = bankById("aku")!;
const size = round(data.banks.aku ?? 0);

export const metadata = pageMeta({
  title: "AKU Test Preparation: MCQs for the Aga Khan University MBBS Test",
  description: `Practice MCQs for the Aga Khan University admission test: ${size} questions in Biology, Chemistry, Physics and Mathematics reasoning, each with a full explanation.`,
  path: "/aku-test",
});

const faqs = [
  { q: "Does AKU accept the MDCAT?", a: "Aga Khan University runs its own admission test for the MBBS programme. Check AKU's admission information for the current year's requirements, since they are set by the university and can change." },
  { q: "Is there negative marking in the AKU test?", a: "In AKU's admission information for 2026-27, the Science Achievement section deducts 0.25 marks for a wrong answer and the Science and Mathematics Reasoning section has no negative marking." },
  { q: "What should I practice for the AKU test?", a: "Science MCQs in Biology, Chemistry and Physics at FSc and A level standard, plus mathematics reasoning. The AKU bank here is arranged the same way." },
  { q: "Is the AKU bank separate from the MDCAT bank?", a: "It is its own bank with its own chapter list, and it shares questions with the MDCAT bank where the content overlaps. One paid plan opens both." },
];

export default function Aku() {
  const trail = [{ name: "Home", href: "/" }, { name: "AKU test", href: "/aku-test" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <PubMark exam="aku" size="lg" />
        <h1>AKU test preparation with MCQs and explanations</h1>
        <p className="lede">
          Aga Khan University holds its own admission test for MBBS: <b>100 MCQs in 2 hours</b>, made of a Science Achievement section (40 MCQs) and a Science and Mathematics Reasoning section (60 MCQs).
          The AKU bank here has <b>{size} MCQs</b> across {bank.subjects.map((s) => s.name).join(", ")}, each with a full explanation.
        </p>
        <div className="pub-acts"><a className="x3-btn x3-blue" href="/signup">Start free</a></div>
      </header>

      {bank.subjects.map((s) => (
        <section key={s.name}>
          <h2 className="with-mark"><PubMark subject={s.name} size="sm" />{s.name}: {s.chapters.length} chapters</h2>
          <ol className="pub-grid">{s.chapters.map((c, i) => <li key={c} className="tile plain"><b><span className="num">{i + 1}.</span>{c}</b></li>)}</ol>
        </section>
      ))}

      <h2>Common questions</h2>
      <div className="pub-faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      <p className="note">
        Test format from AKU's MBBS admission information for 2026-27, checked {checkedText}. AKU has said it may change its test for later cycles, so confirm the format for your year.
        The test format and dates are on <a href="https://www.aku.edu/admissions" rel="noopener">aku.edu/admissions</a>. For sample questions, see the <a href="/mdcat">MDCAT chapter pages</a>.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
    </Shell>
  );
}
