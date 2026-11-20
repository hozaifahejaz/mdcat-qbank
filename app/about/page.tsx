import Shell from "@/components/public/Shell";
import { abs, bankSize, data, ld, mdcat, subjects } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import "../landing-new.css";
import "../public.css";

const line = `${site.name} is an online question bank for Pakistani medical entry tests, with ${bankSize} original MCQs for the PMDC MDCAT, NUMS MDCAT and AKU test, a full explanation on every question, timed mocks and past papers.`;

export const metadata = pageMeta({
  title: "About Markhor Prep and How Questions Are Written and Checked",
  description: line,
  path: "/about",
});

const about = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: abs("/about"),
  mainEntity: { "@type": "EducationalOrganization", name: site.name, url: site.url, logo: abs("/icons/icon-512.png"), email: site.supportEmail, areaServed: "PK", description: line },
};

export default function About() {
  const trail = [{ name: "Home", href: "/" }, { name: "About", href: "/about" }];
  return (
    <Shell trail={trail}>
      <header className="pub-head">
        <h1>About {site.name}</h1>
        <p className="lede">{line}</p>
      </header>

      <div className="pub-stats">
        <div><b>{bankSize}</b><span>original MCQs</span></div>
        <div><b>3</b><span>tests: PMDC MDCAT, NUMS, AKU</span></div>
        <div><b>{subjects.reduce((n, s) => n + s.chapters.length, 0)}</b><span>MDCAT chapters covered</span></div>
        <div><b>100</b><span>questions free</span></div>
      </div>

      <div className="prose">
        <h2>What it is</h2>
        <p>
          {site.name} is a practice tool, not a coaching course. You pick a test, a subject and chapters, answer MCQs, and read why the right answer is right and why each wrong option is wrong.
          You can also sit full mocks of {mdcat.mcqs} MCQs in {mdcat.hours} hours and the {data.paper.year} past paper under the clock, then review your mistakes by chapter.
        </p>
        <p>It is an independent project built in Pakistan, named after the markhor, the national animal. It is not affiliated with PMDC, NUMS, AKU or any university.</p>

        <h2>How questions are written</h2>
        <ul>
          <li>Every question is written for this bank from the official syllabus and the FSc textbooks it is based on. Nothing is copied from textbooks, prep books or other question banks.</li>
          <li>Each question is filed under the syllabus chapter it tests, separately for the PMDC, NUMS and AKU chapter lists, so practice by chapter matches the test you are sitting.</li>
          <li>Past paper questions are rewritten in our own words, with our own worked answers and explanations.</li>
        </ul>

        <h2>How questions are checked</h2>
        <ol>
          <li><b>The answer key</b> is checked against the textbook, line by line.</li>
          <li><b>Every wrong option</b> is checked so that no second option could also be defended as correct.</li>
          <li><b>The explanation</b> is checked for accuracy and has to say why the answer is right and why each other option is not.</li>
          <li><b>After release</b>, any student can report a question from the question screen. Reported questions are reviewed and corrected, and a question with several open reports is held back from new tests until it has been looked at.</li>
        </ol>

        <h2>What it costs</h2>
        <p>100 questions are free with no card. A Season Pass is one payment that lasts until the MDCAT, with no renewal. See <a href="/pricing">pricing</a>.</p>

        <h2>Contact</h2>
        <p>Questions, corrections and feedback are welcome at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(about)} />
    </Shell>
  );
}
