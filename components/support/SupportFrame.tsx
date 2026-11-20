import Logo from "@/components/Logo";
import { PublicFooter, PublicNav } from "@/components/public/Shell";
import ThemeToggle from "@/components/ThemeToggle";

/* The frame for /contact and the ticket page: the public bar and footer in the new look, the classic header in the
   classic look (the same arrangement as the legal pages), and one readable card in the middle. */
export default function SupportFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash">
      <div className="x3 x3-part look-new"><PublicNav /></div>
      <header className="dnav-wrap look-classic">
        <div className="dwrap">
          <div className="dnav">
            <Logo href="/" />
            <div className="dnav-end">
              <ThemeToggle />
              <a className="dpill light small" href="/signin">Sign in</a>
            </div>
          </div>
        </div>
      </header>
      <main className="dwrap">
        <article className="dcard legal support">{children}</article>
      </main>
      <div className="x3 x3-part look-new"><PublicFooter /></div>
    </div>
  );
}
