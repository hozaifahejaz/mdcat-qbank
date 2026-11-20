import Shell from "@/components/public/Shell";
import { bankSize, checkedText, data, faqData, ld, mdcat, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import "../landing-new.css";
import "../public.css";

export const metadata = pageMeta({
  title: `MDCAT MCQs ${site.season}: Chapter-wise Practice for PMDC MDCAT`,
  description: `Chapter-wise MDCAT MCQs for all 5 subjects on the PMDC syllabus, each with the answer and a full explanation. Free sample questions for every chapter.`,
  path: "/mdcat",
});

const faqs = [
  { q: "How many MCQs are in the MDCAT?", a: `The PMDC MDCAT has ${mdcat.mcqs} MCQs in ${mdcat.hours} hours: ${subjects.map((s) => `${s.name} ${s.count}`).join(", ")}. Each question carries one mark and there is no negative marking.` },
  { q: "Which subjects are in the MDCAT?", a: "Biology, Chemistry, Physics, English and Logical Reasoning. Biology is the largest part at 45% of the paper." },
  { q: "Are these MCQs free?", a: "The sample questions on these pages are free to read. A free account opens 100 questions in the app with timed practice and progress tracking, and a Season Pass opens the whole bank." },
  { q: "Where do the questions come from?", a: "Every question is written for this bank from the PMDC syllabus and the FSc textbooks, then checked against the textbook. None are copied from other books or banks." },
];

export default function Mdcat() {
  const trail = [{ name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>MDCAT MCQs for {site.season}, chapter by chapter</h1>
        <p className="lede">
          {site.name} is an online question bank for the PMDC MDCAT with <b>{bankSize} original MCQs</b>, each with a full explanation.
          Pick a subject below to read free sample questions for every chapter on the syllabus.
        </p>
        <div className="pub-acts">
          <a className="x3-btn x3-blue" href="/signup">Start free</a>
          <a className="x3-btn x3-line" href="/mdcat/syllabus">See the syllabus</a>
        </div>
      </header>

      <div className="pub-stats">
        <div><b>{mdcat.mcqs}</b><span>MCQs in the paper</span></div>
        <div><b>{mdcat.hours} hours</b><span>to finish it</span></div>
        <div><b>5</b><span>subjects</span></div>
        <div><b>None</b><span>negative marking</span></div>
      </div>

      <h2>Subjects</h2>
      <div className="pub-grid">
        {subjects.map((s) => (
          <a key={s.slug} className="tile big" href={`/mdcat/${s.slug}`}>
            <b>{s.name} MCQs</b>
            <small>{s.count} of {mdcat.mcqs} questions in the paper · {s.chapters.length} chapters · {s.total.toLocaleString("en-GB")} practice MCQs</small>
          </a>
        ))}
      </div>

      <h2>More for the MDCAT</h2>
      <div className="pub-grid">
        <a className="tile" href="/mdcat/syllabus"><b>Syllabus and paper pattern<small>Every chapter PMDC lists, and the marks per subject</small></b></a>
        <a className="tile" href="/mdcat/past-paper-2026"><b>MDCAT {data.paper.year} paper analysis<small>Which chapters the {data.paper.total} questions came from</small></b></a>
        <a className="tile" href="/mdcat/aggregate-calculator"><b>Aggregate calculator<small>Your merit from MDCAT, FSc and matric marks</small></b></a>
        <a className="tile" href="/nums-mdcat"><b>NUMS MDCAT<small>The separate test for army medical colleges</small></b></a>
        <a className="tile" href="/aku-test"><b>AKU test<small>Aga Khan University&apos;s own admission test</small></b></a>
        <a className="tile" href="/guides"><b>Guides<small>Study plans and how to practice well</small></b></a>
      </div>

      <h2>Common questions</h2>
      <div className="pub-faq">
        {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
      </div>
      <p className="note">Paper details are from PMDC&apos;s notice for MDCAT 2026, checked on {checkedText}. PMDC can change them for {site.season}, and this page will be updated when it does.</p>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqData(faqs))} />
    </Shell>
  );
}
