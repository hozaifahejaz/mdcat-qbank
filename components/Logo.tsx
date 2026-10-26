import { site } from "@/lib/site";

/* A tick on the brand blue: every question checked. */
export default function Logo({ size = 26, href = "#top" }: { size?: number; href?: string }) {
  return (
    <a className="logo" href={href}>
      <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="8" fill="var(--blue)" />
        <path d="m7.5 13.5 3.6 3.6L18.5 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {site.name}
    </a>
  );
}
