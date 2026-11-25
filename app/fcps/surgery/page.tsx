import ExamPage from "@/components/exam/ExamPage";
import { examPage } from "@/lib/exam-pages";
import { pageMeta } from "@/lib/public-meta";
import "../../landing-new.css";
import "../../landing-hero.css";
import "../../landing-areas.css";
import "../../home-range.css";
import "../../exam-page.css";

/* FCPS Part 1, Surgery and allied (lib/exam-pages.ts). Each speciality is its own exam with its own page. */
const exam = examPage("fcps1-surgery");
export const metadata = pageMeta({ ...exam.meta, path: exam.path });

export default function FcpsSurgery() {
  return <ExamPage exam={exam} />;
}
