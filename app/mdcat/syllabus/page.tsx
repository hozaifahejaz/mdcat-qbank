import Shell from "@/components/public/Shell";
import { checkedText, mdcat, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "../../public.css";

export const metadata = pageMeta({
  title: `MDCAT Syllabus and Paper Pattern ${site.season}`,
  description: `The PMDC MDCAT paper pattern: ${mdcat.mcqs} MCQs in ${mdcat.hours} hours, marks per subject, difficulty split and every chapter on the syllabus, with practice MCQs for each.`,
  path: "/mdcat/syllabus",
});

export default function Syllabus() {
  const trail = [{ name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" }, { name: "Syllabus", href: "/mdcat/syllabus" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>MDCAT syllabus and paper pattern</h1>
        <p className="lede">
          The PMDC MDCAT is <b>{mdcat.mcqs} MCQs in {mdcat.hours} hours</b> on paper, in English, with one mark per question and no negative marking.
          It covers five subjects: {subjects.map((s) => `${s.name} (${s.count})`).join(", ")}.
        </p>
        <p className="asof">As held on {mdcat.held2026}. Checked {checkedText}.</p>
      </header>

      <div className="pub-cols">
        <div>
          <h2>Marks per subject</h2>
          <table className="pub-table">
            <thead><tr><th>Subject</th><th className="n">MCQs</th><th className="n">Share</th></tr></thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.slug}><td><a href={`/mdcat/${s.slug}`}>{s.name}</a></td><td className="n">{s.count}</td><td className="n">{Math.round((s.count / mdcat.mcqs) * 100)}%</td></tr>
              ))}
            </tbody>
            <tfoot><tr><td>Total</td><td className="n">{mdcat.mcqs}</td><td className="n">100%</td></tr></tfoot>
          </table>
        </div>
        <div>
          <h2>Difficulty</h2>
          <table className="pub-table">
            <thead><tr><th>Level</th><th className="n">Share of the paper</th></tr></thead>
            <tbody>{mdcat.difficulty.map(([d, n]) => <tr key={d}><td>{d}</td><td className="n">{n}%</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      {subjects.map((s) => (
        <section key={s.slug}>
          <h2>{s.name}: {s.chapters.length} chapters</h2>
          <div className="pub-grid">
            {s.chapters.map((c, i) => (
              <a key={c.slug} className="tile" href={`/mdcat/${s.slug}/${c.slug}`}><b>{i + 1}. {c.name}</b><em>{c.total} MCQs</em></a>
            ))}
          </div>
        </section>
      ))}

      <p className="note">
        Chapter names follow the PMDC MDCAT curriculum. PMDC publishes the official syllabus on <a href="https://pmdc.pk" rel="noopener">pmdc.pk</a> and can revise it for {site.season}.
        Always check the latest official document before you plan your revision.
      </p>
    </Shell>
  );
}
