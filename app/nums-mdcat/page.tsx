import Shell from "@/components/public/Shell";
import { bankById } from "@/lib/banks";
import { checkedText, data, faqData, ld, mdcat, nums, round } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../public.css";

const bank = bankById("nums")!;
const size = round(data.banks.nums ?? 0);

export const metadata = pageMeta({
  title: "NUMS MDCAT MCQs: Practice by NUMS Syllabus Chapter",
  description: `Practice for the NUMS MDCAT with ${size} MCQs sorted by the NUMS syllabus, each with a full explanation. Paper pattern: ${nums.mcqs} MCQs in ${nums.time}.`,
  path: "/nums-mdcat",
});

const faqs = [
  { q: "Is the NUMS MDCAT different from the PMDC MDCAT?", a: `Yes. NUMS holds its own test for the army medical colleges and its affiliated colleges. Its subject paper has ${nums.mcqs} MCQs against ${mdcat.mcqs} in the PMDC MDCAT, it has no Logical Reasoning section, and it adds a short psychological test.` },
  { q: "How many MCQs are in the NUMS MDCAT?", a: `The subject paper has ${nums.mcqs} MCQs in ${nums.time}: ${nums.split.map(([s, n]) => `${s} ${n}`).join(", ")}. A separate psychological test of 50 items follows it. There is no negative marking.` },
  { q: "Can I prepare for both tests together?", a: "Yes. Most of the Biology, Chemistry and Physics content overlaps. Practice the shared chapters once, then cover the chapters that only the NUMS syllabus lists." },
];

export default function Nums() {
  const trail = [{ name: "Home", href: "/" }, { name: "NUMS MDCAT", href: "/nums-mdcat" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>NUMS MDCAT MCQs, sorted by the NUMS syllabus</h1>
        <p className="lede">
          The NUMS MDCAT is the entry test of the National University of Medical Sciences. Its subject paper has <b>{nums.mcqs} MCQs in {nums.time}</b> with no negative marking.
          The NUMS bank here holds {size} MCQs arranged under NUMS&apos;s own chapter list.
        </p>
        <div className="pub-acts"><a className="x3-btn x3-blue" href="/signup">Start free</a></div>
      </header>

      <div className="pub-cols">
        <div>
          <h2>NUMS paper pattern</h2>
          <table className="pub-table">
            <thead><tr><th>Subject</th><th className="n">MCQs</th></tr></thead>
            <tbody>{nums.split.map(([s, n]) => <tr key={s}><td>{s}</td><td className="n">{n}</td></tr>)}</tbody>
            <tfoot><tr><td>Total</td><td className="n">{nums.mcqs}</td></tr></tfoot>
          </table>
        </div>
        <div>
          <h2>NUMS and PMDC side by side</h2>
          <table className="pub-table">
            <thead><tr><th></th><th>NUMS MDCAT</th><th>PMDC MDCAT</th></tr></thead>
            <tbody>
              <tr><td>Subject MCQs</td><td>{nums.mcqs}</td><td>{mdcat.mcqs}</td></tr>
              <tr><td>Time</td><td>{nums.time}</td><td>{mdcat.hours} hours</td></tr>
              <tr><td>Logical Reasoning</td><td>No</td><td>Yes, 9 MCQs</td></tr>
              <tr><td>Psychological test</td><td>Yes, 50 items</td><td>No</td></tr>
              <tr><td>Negative marking</td><td>No</td><td>No</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {bank.subjects.map((s) => (
        <section key={s.name}>
          <h2>NUMS {s.name}: {s.chapters.length} {s.chapters.length === 1 ? "unit" : "units"}</h2>
          <div className="pub-grid">{s.chapters.map((c) => <div key={c} className="tile"><b>{c}</b></div>)}</div>
        </section>
      ))}

      <h2>Common questions</h2>
      <div className="pub-faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      <p className="note">
        Pattern as announced by NUMS for its 2026 test, held on {nums.held2026}. Checked {checkedText}. NUMS publishes its syllabus and policy on <a href="https://numspak.edu.pk" rel="noopener">numspak.edu.pk</a>.
        For sample questions on the shared chapters, see the <a href="/mdcat">MDCAT chapter pages</a>.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
    </Shell>
  );
}
