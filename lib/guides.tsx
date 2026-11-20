/* The guides at /guides. Each is plain writing with a short answer first, since that is what a student wants and
   what a search engine quotes. Facts about the tests come from lib/public.ts so they change in one place. */
import type { ReactNode } from "react";
import { mdcat, nums, subjects } from "@/lib/public";
import { site } from "@/lib/site";

export type Guide = { slug: string; title: string; description: string; answer: string; updated: string; body: ReactNode };

const split = subjects.map((s) => `${s.name} ${s.count}`).join(", ");

export const guides: Guide[] = [
  {
    slug: "how-to-prepare-for-mdcat",
    title: `How to prepare for MDCAT ${site.season}: a plan that fits around FSc`,
    description: `A month-by-month MDCAT ${site.season} study plan: what to cover first, how many MCQs to practice a day, and when to start full mocks.`,
    answer: `Finish the syllabus chapter by chapter with MCQs after every chapter, spend your time in proportion to the paper (${split}), and switch to full timed mocks in the last six weeks.`,
    updated: "2026-11-20",
    body: (
      <>
        <h2>Start from the paper, not the books</h2>
        <p>The MDCAT has {mdcat.mcqs} MCQs in {mdcat.hours} hours: {split}. Biology and Chemistry together are 70% of your marks, so they deserve about 70% of your hours. English and Logical Reasoning are 18 questions between them, and they are quick to improve with regular short practice.</p>
        <p>Print the <a href="/mdcat/syllabus">chapter list</a> and tick chapters off. A plan you can see is a plan you keep.</p>

        <h2>Phase 1: cover every chapter once</h2>
        <ul>
          <li>Read one chapter from the textbook, then answer MCQs on that chapter the same day.</li>
          <li>Aim for 40 to 60 MCQs a day on school days and 100 or more on free days.</li>
          <li>Read the explanation for every question you got wrong and every question you guessed.</li>
          <li>Keep a single list of the facts you keep forgetting. Read it once a week.</li>
        </ul>

        <h2>Phase 2: fix weak chapters</h2>
        <p>Once every chapter has been covered, your results by chapter show where the marks are. A chapter at 55% gives more marks per hour than a chapter at 85%. Redo your wrong questions first, then practice fresh questions on the same chapter until it reaches 75% or more.</p>

        <h2>Phase 3: full mocks in the last six weeks</h2>
        <ul>
          <li>Sit one full mock of {mdcat.mcqs} MCQs in {mdcat.hours} hours every week, at the same time of day as the real test.</li>
          <li>That is one minute per question. Mark and move on when a question takes longer.</li>
          <li>There is no negative marking, so never leave a question blank.</li>
          <li>Spend as long reviewing the mock as you spent sitting it.</li>
        </ul>

        <h2>If you have three months or less</h2>
        <p>Skip nothing in Biology, do the high-yield Chemistry and Physics chapters first, and start weekly mocks straight away. The <a href="/mdcat/past-paper-2026">2026 paper analysis</a> shows which chapters carried the most questions.</p>

        <h2>Common mistakes</h2>
        <ul>
          <li>Reading for months without answering MCQs. Recall under time pressure is a separate skill.</li>
          <li>Doing thousands of MCQs without reading the explanations.</li>
          <li>Leaving English and Logical Reasoning to the last week.</li>
          <li>Ignoring FSc marks. They are {mdcat.weights.hssc}% of your <a href="/mdcat/aggregate-calculator">aggregate</a>.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "how-to-practice-mcqs",
    title: "How to practice MCQs so your score actually goes up",
    description: "A method for MCQ practice: untimed first, then timed, review every wrong answer, and redo mistakes after a few days.",
    answer: "Practice a chapter untimed until you understand it, then timed at one minute a question, and review every wrong or guessed answer the same day. Redo those questions a few days later.",
    updated: "2026-11-20",
    body: (
      <>
        <h2>Untimed first, timed second</h2>
        <p>When a chapter is new, answer its questions without a clock and read the explanation after each one. The aim is to understand why. When you are above 70% on a chapter, switch to timed sets of 20 to 30 questions at one minute each, which is the pace of the real paper.</p>

        <h2>Review is where the marks come from</h2>
        <p>For each wrong answer, decide which of three things happened:</p>
        <ul>
          <li><b>You did not know the fact.</b> Go back to the textbook page and add it to your forgetting list.</li>
          <li><b>You knew it but misread the question.</b> Underline words like not, except, always and most in the stem.</li>
          <li><b>You were between two options.</b> Read why the other option is wrong. This is where a good explanation matters most.</li>
        </ul>
        <p>Review guessed answers too, even the ones you got right. A lucky guess is a wrong answer waiting for the real paper.</p>

        <h2>Redo your mistakes</h2>
        <p>Answer your wrong questions again after three or four days, without looking at the answer first. If you get one wrong twice, the gap is in the concept and not the question, so reread that part of the chapter.</p>

        <h2>Mix chapters once you are confident</h2>
        <p>The real paper jumps between chapters. After a subject is covered, practice mixed sets from the whole subject so you learn to recognise which chapter a question belongs to.</p>

        <h2>How many MCQs is enough?</h2>
        <p>There is no magic number. Two hundred questions reviewed properly beat a thousand rushed. A useful check is your score on questions you have never seen: when that is steady above your target across every chapter, you are ready for full mocks.</p>
      </>
    ),
  },
  {
    slug: "mdcat-vs-nums-vs-aku",
    title: "MDCAT vs NUMS vs AKU test: what is different and how to prepare for all three",
    description: `The PMDC MDCAT, NUMS MDCAT and AKU test compared: number of MCQs, time, subjects and negative marking, and how to prepare for more than one.`,
    answer: `The PMDC MDCAT is ${mdcat.mcqs} MCQs in ${mdcat.hours} hours with five subjects. The NUMS MDCAT is ${nums.mcqs} subject MCQs in ${nums.time} plus a psychological test. The AKU test is 100 MCQs in 2 hours with a reasoning section and some negative marking.`,
    updated: "2026-11-20",
    body: (
      <>
        <h2>Side by side</h2>
        <div className="pub-scroll"><table className="pub-table">
          <thead><tr><th></th><th>PMDC MDCAT</th><th>NUMS MDCAT</th><th>AKU test</th></tr></thead>
          <tbody>
            <tr><td>For</td><td>Public and private medical and dental colleges</td><td>Army medical colleges and NUMS affiliates</td><td>Aga Khan University</td></tr>
            <tr><td>MCQs</td><td>{mdcat.mcqs}</td><td>{nums.mcqs}, plus a 50-item psychological test</td><td>100</td></tr>
            <tr><td>Time</td><td>{mdcat.hours} hours</td><td>{nums.time}</td><td>2 hours</td></tr>
            <tr><td>Subjects</td><td>Biology, Chemistry, Physics, English, Logical Reasoning</td><td>Biology, Chemistry, Physics, English</td><td>Science achievement, science and mathematics reasoning</td></tr>
            <tr><td>Negative marking</td><td>No</td><td>No</td><td>0.25 in the science achievement section</td></tr>
          </tbody>
        </table></div>
        <p>Figures are from each body&apos;s 2026 notices and can change. Check the official notice for your year before the test.</p>

        <h2>What overlaps</h2>
        <p>Biology, Chemistry and Physics at FSc level are the core of all three. If you prepare the PMDC syllabus well, you have covered most of the NUMS science content and the science achievement part of the AKU test.</p>

        <h2>What is different</h2>
        <ul>
          <li><b>NUMS</b> has no Logical Reasoning, gives English more questions, and lists some chapters PMDC does not. See the <a href="/nums-mdcat">NUMS chapter list</a>.</li>
          <li><b>AKU</b> tests reasoning with numbers and data, which FSc does not train directly. Practice quantitative comparison, data sufficiency and reading graphs. See the <a href="/aku-test">AKU page</a>.</li>
          <li><b>AKU</b> has negative marking in one section, so blind guessing costs marks there. In the MDCAT and NUMS tests, always answer every question.</li>
        </ul>

        <h2>Preparing for more than one</h2>
        <ol>
          <li>Build your plan around the <a href="/mdcat">PMDC MDCAT</a>, since it has the widest syllabus and decides most seats.</li>
          <li>Add the NUMS-only chapters in the month before the NUMS test.</li>
          <li>Give AKU reasoning two or three short sessions a week from the start. It improves slowly and steadily.</li>
        </ol>
      </>
    ),
  },
];

export const guideBySlug = (s: string) => guides.find((g) => g.slug === s);
