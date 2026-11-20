import { notFound } from "next/navigation";
import Shell from "@/components/public/Shell";
import { guideBySlug, guides } from "@/lib/guides";
import { abs, ld } from "@/lib/public";
import { pageMeta } from "@/lib/public-meta";
import { site } from "@/lib/site";
import "../../landing-new.css";
import "../../public.css";

export const dynamicParams = false;
export const generateStaticParams = () => guides.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  return g ? pageMeta({ title: g.title, description: g.description, path: `/guides/${g.slug}`, updated: g.updated }) : {};
}

const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const trail = [{ name: "Home", href: "/" }, { name: "Guides", href: "/guides" }, { name: g.title, href: `/guides/${g.slug}` }];
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    dateModified: g.updated,
    datePublished: g.updated,
    mainEntityOfPage: abs(`/guides/${g.slug}`),
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: abs("/icons/icon-512.png") } },
  };
  return (
    <Shell trail={trail} article>
      <header className="pub-head">
        <h1>{g.title}</h1>
        <p className="lede"><b>In short:</b> {g.answer}</p>
        <p className="asof">By {site.name}. Updated {day(g.updated)}.</p>
      </header>
      <article className="prose">{g.body}</article>
      <h2>More guides</h2>
      <div className="pub-grid two">
        {guides.filter((x) => x !== g).map((x) => <a key={x.slug} className="tile" href={`/guides/${x.slug}`}><b>{x.title}</b></a>)}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(article)} />
    </Shell>
  );
}
