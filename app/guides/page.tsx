import Shell from "@/components/public/Shell";
import { guides } from "@/lib/guides";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../public.css";

export const metadata = pageMeta({
  title: "MDCAT Preparation Guides",
  description: "Short, practical guides for MDCAT, NUMS and AKU preparation: study plans, how to practice MCQs and how the tests differ.",
  path: "/guides",
});

export default function Guides() {
  const trail = [{ name: "Home", href: "/" }, { name: "Guides", href: "/guides" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>MDCAT preparation guides</h1>
        <p className="lede">Short, practical guides on planning your preparation and getting more out of every MCQ.</p>
      </header>
      <div className="pub-grid two">
        {guides.map((g) => (
          <a key={g.slug} className="tile big" href={`/guides/${g.slug}`}>
            <b>{g.title}</b>
            <small>{g.description}</small>
          </a>
        ))}
      </div>
    </Shell>
  );
}
