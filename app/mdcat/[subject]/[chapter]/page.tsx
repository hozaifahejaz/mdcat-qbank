import { notFound } from "next/navigation";
import { PubMark } from "@/components/public/Mark";
import Shell from "@/components/public/Shell";
import Question from "@/components/public/Question";
import { subjectBySlug, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../../../landing-new.css";
import "../../../public.css";

export const dynamicParams = false;
export const generateStaticParams = () => subjects.flatMap((s) => s.chapters.map((c) => ({ subject: s.slug, chapter: c.slug })));

type Params = Promise<{ subject: string; chapter: string }>;
const find = async (params: Params) => {
  const p = await params;
  const s = subjectBySlug(p.subject);
  const c = s?.chapters.find((x) => x.slug === p.chapter);
  return s && c ? { s, c } : null;
};

export async function generateMetadata({ params }: { params: Params }) {
  const f = await find(params);
  if (!f) return {};
  return pageMeta({
    title: `${f.c.name} MCQs for MDCAT (${f.s.name})`,
    description: `${f.c.name} MCQs for the MDCAT with answers and full explanations. ${f.c.samples.length} free sample questions here, ${f.c.total} in the full ${f.s.name} bank.`,
    path: `/mdcat/${f.s.slug}/${f.c.slug}`,
  });
}

export default async function Chapter({ params }: { params: Params }) {
  const f = await find(params);
  if (!f) notFound();
  const { s, c } = f;
  const trail = [
    { name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" },
    { name: s.name, href: `/mdcat/${s.slug}` }, { name: c.name, href: `/mdcat/${s.slug}/${c.slug}` },
  ];
  const at = s.chapters.indexOf(c);
  const topics = [...new Set(c.samples.map((q) => q.topic).filter(Boolean))];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <PubMark subject={s.name} size="lg" />
        <h1>{c.name} MCQs for MDCAT</h1>
        <p className="lede">
          {c.name} is chapter {at + 1} of {s.chapters.length} in the PMDC MDCAT {s.name} syllabus.
          Below are <b>{c.samples.length} sample MCQs with answers and explanations</b>. The full bank has {c.total} questions on this chapter.
        </p>
        <div className="pub-acts">
          <a className="x3-btn x3-blue" href="/signup">Practice all {c.total} questions</a>
        </div>
      </header>

      <h2>Sample questions</h2>
      <div className="pub-qs">
        {c.samples.map((q, i) => <Question key={q.id} q={q} n={i + 1} />)}
      </div>
      {topics.length > 0 && <p className="note">Topics in these questions: {topics.join(", ")}.</p>}

      <h2>More {s.name} chapters</h2>
      <div className="pub-grid">
        {s.chapters.filter((x) => x !== c).map((x) => (
          <a key={x.slug} className="tile" href={`/mdcat/${s.slug}/${x.slug}`}><b>{x.name}</b><em>{x.total} MCQs</em></a>
        ))}
      </div>
    </Shell>
  );
}
