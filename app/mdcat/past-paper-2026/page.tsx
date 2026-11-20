import Shell from "@/components/public/Shell";
import Question from "@/components/public/Question";
import { data, mdcat, slug, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../../landing-new.css";
import "../../public.css";

const p = data.paper;

export const metadata = pageMeta({
  title: `UHS MDCAT ${p.year} Past Paper: Chapter-wise Analysis and Solved Questions`,
  description: `Which chapters the ${p.total} questions of the UHS (Punjab) MDCAT ${p.year} paper came from, subject by subject, with ${p.samples.length} solved questions and explanations.`,
  path: "/mdcat/past-paper-2026",
});

export default function Paper() {
  const trail = [{ name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" }, { name: `${p.year} paper`, href: "/mdcat/past-paper-2026" }];
  const top = subjects.map((s) => ({ s, first: p.chapters[s.name]?.[0] })).filter((x) => x.first);
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>UHS MDCAT {p.year} past paper: where the questions came from</h1>
        <p className="lede">
          We sorted all <b>{p.total} questions of the UHS MDCAT {p.year} paper</b>, the one sat in Punjab, by syllabus chapter.
          The most tested chapter in each subject was {top.map((x) => `${x.first!.chapter} in ${x.s.name} (${x.first!.n})`).join(", ")}.
        </p>
        <div className="pub-acts">
          <a className="x3-btn x3-blue" href="/signup">Start free</a>
          <a className="x3-btn x3-line" href="/pricing">Sit the whole paper, timed</a>
        </div>
      </header>

      <h2>Questions per chapter</h2>
      <div className="pub-cols">
        {subjects.filter((s) => p.chapters[s.name]).map((s) => (
          <table key={s.slug} className="pub-table">
            <thead><tr><th>{s.name}</th><th className="n">Questions</th></tr></thead>
            <tbody>
              {p.chapters[s.name].map((c) => (
                <tr key={c.chapter}><td><a href={`/mdcat/${s.slug}/${slug(c.chapter)}`}>{c.chapter}</a></td><td className="n">{c.n}</td></tr>
              ))}
            </tbody>
            <tfoot><tr><td>Total</td><td className="n">{p.chapters[s.name].reduce((n, c) => n + c.n, 0)}</td></tr></tfoot>
          </table>
        ))}
      </div>

      <h2>{p.samples.length} solved questions from the paper</h2>
      <div className="pub-qs">
        {p.samples.map((q, i) => <Question key={q.id} q={q} n={i + 1} />)}
      </div>

      <p className="note">
        Each province sets its own MDCAT paper on the same PMDC syllabus, and this is the paper UHS published. The questions are rewritten in our own words, and the answers and explanations are our own working, since UHS published no answer key.
        The full paper of {mdcat.mcqs} questions can be sat under the clock with a Season Pass.
      </p>
    </Shell>
  );
}
