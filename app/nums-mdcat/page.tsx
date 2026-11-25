import ExamPage from "@/components/exam/ExamPage";
import { examPage } from "@/lib/exam-pages";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../landing-hero.css";
import "../landing-areas.css";
import "../exam-page.css";

/* The NUMS exam page (lib/exam-pages.ts). */
const exam = examPage("nums");
export const metadata = pageMeta({ ...exam.meta, path: exam.path });

export default function Nums() {
  return <ExamPage exam={exam} />;
}
