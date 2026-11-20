import { PublicFooter, PublicNav } from "@/components/public/Frame";

/* The frame for /contact and the ticket page: the public bar and footer (the same
   arrangement as the legal pages), and one readable card in the middle. */
export default function SupportFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash">
      <div className="x3 x3-part"><PublicNav /></div>
      <main className="dwrap">
        <article className="dcard legal support">{children}</article>
      </main>
      <div className="x3 x3-part"><PublicFooter /></div>
    </div>
  );
}
