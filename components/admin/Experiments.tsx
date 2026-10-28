import { PageHead } from "@/components/app/AppShell";
import { experimentHref, experiments } from "@/lib/experiments";

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/* /admin/experiments — numbered landing page experiments, each a link to its own page. */
export default function Experiments() {
  return (
    <div className="dgrid">
      <PageHead title="Experiments" sub="Landing page ideas. The live page isn't changed by any of them." />
      <ul className="exp-list">
        {experiments.map((e) => (
          <li key={e.n} className="box">
            <a className="exp-row" href={experimentHref(e.n)} target="_blank" rel="noopener">
              <span className="exp-n">{e.n}</span>
              <span className="exp-copy">
                <b>{e.title}</b>
                <span className="muted">{e.note}</span>
                <span className="exp-meta">Inspired by {host(e.inspiredBy)} · {experimentHref(e.n)}</span>
              </span>
              <span className="dpill light small">Open</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
