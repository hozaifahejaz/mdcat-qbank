import ExamPage from "@/components/exam/ExamPage";
import { examPage } from "@/lib/exam-pages";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../landing-hero.css";
import "../landing-areas.css";
import "../home-range.css";
import "../exam-page.css";

/* The AKU exam page (lib/exam-pages.ts). */
const exam = examPage("aku");
export const metadata = pageMeta({ ...exam.meta, path: exam.path });

export default function Aku() {
  return <ExamPage exam={exam} />;
}
