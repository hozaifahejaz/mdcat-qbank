"use client";

import { useState } from "react";
import { ExamMark } from "@/components/Marks";
import { LEGACY, type Exam, myExams } from "@/lib/exams";
import { savePrefs } from "@/lib/prefs";
import { lastUser } from "@/lib/user";

/* The exam a bank belongs to among the student's own: the exam whose bank it is, else their first exam that opens
   it (a textbook bank under an entrance test). */
export function examOfBank(list: Exam[], bank: string | undefined): Exam | undefined {
  return list.find((e) => e.bank === bank) ?? list.find((e) => bank && (e.banks as string[]).includes(bank)) ?? list[0];
}
export const usersExams = () => myExams(lastUser()?.exams?.length ? lastUser()!.exams! : LEGACY.exams);

/* Beside the greeting: the exam the home screen is showing. With one exam it is a plain label that opens My exams.
   With several it switches between them, and the choice is kept: the app opens on that exam from then on. */
export default function ExamLabel({ bank, onBank }: { bank: string | undefined; onBank?: (bank: string) => void }) {
  const list = usersExams();
  const now = examOfBank(list, bank);
  const [pressed, setPressed] = useState<string | null>(null);
  const lit = pressed ?? now?.id;
  if (!now) return null;
  if (list.length < 2 || !onBank) {
    return <a className="exam-label" href="/account/exams" aria-label={`Preparing for ${now.name}. Change your exams.`}><ExamMark id={now.bank} size={16} />{now.name}</a>;
  }
  function pick(e: Exam) {
    if (e.id === lit) return;
    setPressed(e.id);
    try { localStorage.setItem("practice-bank", e.bank); } catch {}
    savePrefs({ bank: e.bank }).catch(() => {});
    onBank!(e.bank);
  }
  return (
    <div className="exam-switch" role="radiogroup" aria-label="The exam shown here">
      {list.map((e) => (
        <button key={e.id} type="button" role="radio" aria-checked={e.id === lit} onClick={() => pick(e)}><ExamMark id={e.bank} size={15} />{e.short}</button>
      ))}
    </div>
  );
}
