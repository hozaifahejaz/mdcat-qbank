import ExamPage from "@/components/exam/ExamPage";
import { examPage } from "@/lib/exam-pages";
import { pageMeta } from "@/lib/public-meta";
import "../landing-new.css";
import "../landing-hero.css";
import "../landing-areas.css";
import "../home-range.css";
import "../exam-page.css";

/* The ECAT exam page (lib/exam-pages.ts). Engineering isn't open yet, so it asks for an email in place of prices. */
const exam = examPage("ecat");
export const metadata = pageMeta({ ...exam.meta, path: exam.path });

export default function Ecat() {
  return <ExamPage exam={exam} />;
}
