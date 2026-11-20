import { notFound } from "next/navigation";
import Shell from "@/components/public/Shell";
import Question from "@/components/public/Question";
import { mdcat, subjectBySlug, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "../../public.css";

export const dynamicParams = false;
export const generateStaticParams = () => subjects.map((s) => ({ subject: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const s = subjectBySlug((await params).subject);
  if (!s) return {};
  return pageMeta({
    title: `MDCAT ${s.name} MCQs ${site.season}: All ${s.chapters.length} Chapters`,
    description: `MDCAT ${s.name} MCQs by chapter with answers and explanations. ${s.name} is ${s.count} of the ${mdcat.mcqs} questions in the paper. Free samples for all ${s.chapters.length} chapters.`,
    path: `/mdcat/${s.slug}`,
  });
}

export default async function Subject({ params }: { params: Promise<{ subject: string }> }) {
  const s = subjectBySlug((await params).subject);
  if (!s) notFound();
  const trail = [{ name: "Home", href: "/" }, { name: "MDCAT", href: "/mdcat" }, { name: s.name, href: `/mdcat/${s.slug}` }];
  const first = s.chapters.find((c) => c.samples.length);
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>MDCAT {s.name} MCQs by chapter</h1>
        <p className="lede">
          {s.name} is <b>{s.count} of the {mdcat.mcqs} questions</b> in the PMDC MDCAT, which is {Math.round((s.count / mdcat.mcqs) * 100)}% of the paper.
          The syllabus has {s.chapters.length} {s.name} chapters, and the bank holds {s.total.toLocaleString("en-GB")} practice MCQs across them.
        </p>
      </header>

      <h2>{s.name} chapters</h2>
      <div className="pub-grid">
        {s.chapters.map((c) => (
          <a key={c.slug} className="tile" href={`/mdcat/${s.slug}/${c.slug}`}>
            <b>{c.name}</b>
            <em>{c.total} MCQs</em>
          </a>
        ))}
      </div>

      {first && (
        <>
          <h2>Try one: {first.name}</h2>
          <div className="pub-qs">
            {first.samples.slice(0, 2).map((q, i) => <Question key={q.id} q={q} n={i + 1} />)}
          </div>
        </>
      )}

      <h2>Other subjects</h2>
      <div className="pub-grid">
        {subjects.filter((x) => x.slug !== s.slug).map((x) => (
          <a key={x.slug} className="tile" href={`/mdcat/${x.slug}`}><b>{x.name}</b><em>{x.count} in the paper</em></a>
        ))}
      </div>
    </Shell>
  );
}
