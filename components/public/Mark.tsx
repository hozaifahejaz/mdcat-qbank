import { ExamMark, SubjectMark } from "@/components/Marks";
import { toneOf } from "@/lib/banks";

const examTone: Record<string, { tone: string; solid: string }> = {
  mdcat: { tone: "var(--cta)", solid: "var(--on-cta)" },
  nums: { tone: "var(--peach)", solid: "var(--warn)" },
  aku: { tone: "var(--lilac)", solid: "#8a63ff" },
};

/* A subject's or test's mark in its tinted tile, as the app shows it. */
export function PubMark({ subject, exam, size = "md" }: { subject?: string; exam?: string; size?: "sm" | "md" | "lg" }) {
  const t = exam ? examTone[exam] ?? toneOf("") : toneOf(subject ?? "");
  const px = size === "lg" ? 30 : size === "sm" ? 16 : 22;
  return (
    <span className={`pub-mark ${size}`} style={{ background: t.tone, color: t.solid }} aria-hidden="true">
      {exam ? <ExamMark id={exam} size={px} /> : <SubjectMark subject={subject ?? ""} size={px} />}
    </span>
  );
}
