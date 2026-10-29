import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/site";

type TopLink = { hint?: string; label: string; href: string };

/* The frame around every auth screen: logo home, theme switch, one helpful link, and an optional side panel
   that explains the account (and the two-device rule) before anyone signs up. */
export default function AuthFrame({ children, side = false, top }: { children: React.ReactNode; side?: boolean; top?: TopLink }) {
  return (
    <div className="auth">
      <header className="auth-wrap auth-top">
        <Logo href="/" />
        <div className="end">
          {top && (
            <span>
              {top.hint && <span className="hint muted">{top.hint} </span>}
              <a href={top.href}>{top.label}</a>
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>
      <main className={`auth-wrap auth-main${side ? "" : " solo"}`}>
        {children}
        {side && <SidePanel />}
      </main>
      <footer className="auth-wrap auth-foot">
        {site.name} is independent and not affiliated with PMDC, NUMS or any university.
      </footer>
    </div>
  );
}

function SidePanel() {
  return (
    <aside className="auth-side" aria-label="What you get">
      <h2>One account, on your phone and laptop.</h2>
      <ul>
        <li>{site.launched ? "Free chapter-wise MCQs to start, with a full explanation on every one." : "Free chapter-wise MCQs as soon as the bank opens, with a full explanation on every one."}</li>
        <li>Your progress, mocks and weak chapters follow you to either device.</li>
      </ul>
      <div className="devices-sketch" aria-hidden="true">
        <div className="lap"><i /><i /><i style={{ width: "60%" }} /></div>
        <div className="ph"><i /><i style={{ width: "70%" }} /></div>
      </div>
    </aside>
  );
}
