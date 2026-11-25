import ExamPage from "@/components/exam/ExamPage";
import { examPage } from "@/lib/exam-pages";
import { data } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../landing-hero.css";
import "../landing-areas.css";
import "../home-range.css";
import "../exam-page.css";

/* The MDCAT exam page (lib/exam-pages.ts). Its 68 chapter pages, the syllabus and the 2026 paper sit under it. */
const exam = examPage("mdcat");
export const metadata = pageMeta({ ...exam.meta, path: exam.path });

const more = [
  { href: "/mdcat/syllabus", name: "Syllabus and paper pattern", line: "Every chapter PMDC lists, and the marks per subject" },
  { href: "/mdcat/past-paper-2026", name: `MDCAT ${data.paper.year} paper analysis`, line: `Which chapters the ${data.paper.total} questions came from` },
  { href: "/mdcat/aggregate-calculator", name: "Aggregate calculator", line: "Your merit from MDCAT, FSc and matric marks" },
  { href: "/guides", name: "Guides", line: "Study plans and how to practice well" },
];

export default function Mdcat() {
  return (
    <ExamPage exam={exam}>
      <section className="x3-sec xe-sec">
        <div className="x3-wrap">
          <div className="x3-head"><h2>More for the MDCAT</h2></div>
          <div className="xe-more">
            {more.map((m) => <a key={m.href} className="x3-card xe-topic" href={m.href}><b>{m.name}</b><small>{m.line}</small></a>)}
          </div>
        </div>
      </section>
    </ExamPage>
  );
}
