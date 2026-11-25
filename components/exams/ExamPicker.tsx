"use client";

import Icon from "@/components/app/Icon";
import { ExamMark } from "@/components/Marks";
import { type AreaId, areas, examById, examsIn, startingExam } from "@/lib/exams";

/* What a student has ticked: some exams, or "not sure yet". `main` is the exam the app opens on. */
export type Picked = { exams: string[]; unsure: boolean; main: string | null };
export const nothingPicked: Picked = { exams: [], unsure: false, main: null };

/* What gets saved: a student who isn't sure starts with the test most students in the area sit. */
export function toSave(area: AreaId, p: Picked): { exams: string[]; main: string } | null {
  const exams = p.unsure ? [startingExam[area]].filter((x): x is string => !!x) : p.exams;
  if (!exams.length) return null;
  return { exams, main: p.main && exams.includes(p.main) ? p.main : exams[0]! };
}

/* A saved list back as ticks (My exams). */
export const fromSaved = (exams: string[], main?: string | null): Picked => ({ exams, unsure: false, main: main && exams.includes(main) ? main : exams[0] ?? null });

/* The areas as cards. Ones that aren't open yet are shown, so a visitor sees what is coming, but can't be picked. */
export function AreaOptions({ value, onChange, labelledBy }: { value: AreaId | null; onChange: (a: AreaId) => void; labelledBy: string }) {
  return (
    <div className="wel-opts" role="radiogroup" aria-labelledby={labelledBy}>
      {areas.map((a) => (
        <button key={a.id} type="button" role="radio" aria-checked={value === a.id} disabled={!a.open} className="wel-opt" onClick={() => onChange(a.id)}>
          <b>{a.name}</b><span>{a.blurb}</span>
          {!a.open && <em className="wel-soon">Coming soon</em>}
        </button>
      ))}
    </div>
  );
}

/* The exams of one area as tick boxes. Entrance tests can be ticked together; the textbooks on their own and
   "not sure yet" each stand alone, so ticking one clears the others. */
export function ExamOptions({ area, value, onChange, labelledBy, unsure = true }: { area: AreaId; value: Picked; onChange: (p: Picked) => void; labelledBy: string; unsure?: boolean }) {
  const all = examsIn(area);
  const tests = all.filter((e) => !e.group);
  const books = all.filter((e) => e.group);
  const has = (id: string) => value.exams.includes(id);
  const onBooks = books.some((e) => has(e.id));
  const ordered = (ids: string[]) => all.filter((e) => ids.includes(e.id)).map((e) => e.id);
  const set = (ids: string[]) => {
    const exams = ordered(ids);
    onChange({ exams, unsure: false, main: value.main && exams.includes(value.main) ? value.main : exams[0] ?? null });
  };
  const toggleTest = (id: string) => {
    const mine = value.exams.filter((x) => !examById(x)?.group);
    set(mine.includes(id) ? mine.filter((x) => x !== id) : [...mine, id]);
  };
  const toggleBooks = () => set(onBooks ? [] : books.map((e) => e.id));
  const togglePart = (id: string) => {
    const mine = value.exams.filter((x) => examById(x)?.group);
    set(mine.includes(id) ? mine.filter((x) => x !== id) : [...mine, id]);
  };
  const picked = tests.filter((e) => has(e.id));

  return (
    <div className="wel-exams">
      <div className="wel-opts" role="group" aria-labelledby={labelledBy}>
        {tests.map((e) => (
          <button key={e.id} type="button" role="checkbox" aria-checked={has(e.id)} className="wel-opt tick" onClick={() => toggleTest(e.id)}>
            <span className={`wel-mark bank-${e.bank}`}><ExamMark id={e.id} fallback={e.bank} size={22} /></span><b>{e.name}</b><span>{e.blurb}</span>
            <i className="wel-box" aria-hidden="true"><Icon name="check" size={14} /></i>
          </button>
        ))}
        {books.length > 0 && (
          <button type="button" role="checkbox" aria-checked={onBooks} className="wel-opt tick" onClick={toggleBooks}>
            <span className={`wel-mark bank-${books[0]!.bank}`}><ExamMark id={books[0]!.bank} size={22} /></span><b>FSc only</b><span>Textbook chapters, no entrance test</span>
            <i className="wel-box" aria-hidden="true"><Icon name="check" size={14} /></i>
          </button>
        )}
        {unsure && (
          <button type="button" role="checkbox" aria-checked={value.unsure} className="wel-opt tick plain" onClick={() => onChange(value.unsure ? nothingPicked : { exams: [], unsure: true, main: null })}>
            <b>Not sure yet</b><span>Start with {examById(startingExam[area])?.name ?? "the main test"}, change any time</span>
            <i className="wel-box" aria-hidden="true"><Icon name="check" size={14} /></i>
          </button>
        )}
      </div>

      {onBooks && (
        <div className="wel-more">
          <span className="wel-q">Which part?</span>
          <div className="chips" role="group" aria-label="FSc part">
            {books.map((e) => <button key={e.id} type="button" className="chip" aria-pressed={has(e.id)} onClick={() => togglePart(e.id)}>{e.name.replace("FSc ", "")}</button>)}
          </div>
        </div>
      )}
      {picked.length > 1 && (
        <div className="wel-more">
          <span className="wel-q">Which one first?</span>
          <div className="chips" role="radiogroup" aria-label="The test to start with">
            {picked.map((e) => <button key={e.id} type="button" role="radio" aria-checked={value.main === e.id} aria-pressed={value.main === e.id} className="chip" onClick={() => onChange({ ...value, main: e.id })}>{e.short}</button>)}
          </div>
        </div>
      )}
      {picked.length > 0 && <p className="muted small">Each test opens its own question bank and mocks, with the FSc textbook chapters behind it.</p>}
    </div>
  );
}
