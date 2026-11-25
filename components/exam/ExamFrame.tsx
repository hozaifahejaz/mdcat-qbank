/* The bar and footer of an exam page and of the study pages under it. They name this exam only: the logo is the one
   way back to the rest of the site, and no other exam or area appears (Huzaifa 2026-11-25). Plain markup, so the study
   pages that ship without script (components/public/Shell.tsx) can use them too. */
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import type { ExamPage } from "@/lib/exam-pages";
import { site } from "@/lib/site";

/* on: the exam page itself links to its own sections; a study page under it links back to them. */
type Brand = Pick<ExamPage, "short" | "path" | "colour" | "open">;

export function ExamNav({ exam, start, on = true, links, cta }: { exam: Brand; start: string; on?: boolean; links?: { name: string; href: string }[]; cta?: { name: string; href: string } }) {
  const at = (id: string) => (on ? `#${id}` : `${exam.path}#${id}`);
  const items = links ?? [{ name: "The paper", href: at("paper") }, { name: "Try a question", href: at("try") }, { name: exam.open ? "Pricing" : "Opening soon", href: at("pricing") }, { name: "FAQ", href: at("faq") }];
  return (
    <nav className="x3-nav xe-nav">
      <div className="x3-wrap x3-navin">
        <span className="xe-brand">
          <Logo href="/" size={22} />
          <a className="xe-exam" href={on ? "#top" : exam.path} style={{ ["--c" as string]: exam.colour }}>{exam.short}</a>
        </span>
        <ul>
          {items.map((l) => <li key={l.href}><a href={l.href}>{l.name}</a></li>)}
        </ul>
        <div className="x3-navend">
          <ThemeToggle />
          <a className="x3-signin" href="/signin">Sign in</a>
          {(() => { const b = cta ?? (exam.open ? { name: "Start free", href: start } : { name: "Notify me", href: at("pricing") }); return <a className="x3-btn x3-dark" href={b.href}>{b.name}</a>; })()}
        </div>
      </div>
    </nav>
  );
}

export function ExamFooter({ exam }: { exam: Pick<ExamPage, "short" | "path" | "body" | "links"> }) {
  return (
    <footer className="x3-foot">
      <div className="x3-wrap">
        <div className="x3-footin wide">
          <div>
            <Logo href="/" size={22} />
            <p>Start practicing<br />today.</p>
          </div>
          <ul>
            <li><b>{exam.short}</b></li>
            <li><a href={exam.path}>{exam.short} MCQs</a></li>
            {exam.links.map((l) => <li key={l.href}><a href={l.href}>{l.name}</a></li>)}
          </ul>
          <ul>
            <li><b>{site.name}</b></li>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/signin">Sign in</a></li>
          </ul>
          <ul>
            <li><b>Legal</b></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/refunds">Refunds</a></li>
          </ul>
        </div>
        <p className="x3-fine">Not affiliated with {exam.body} or any university. © {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  );
}
