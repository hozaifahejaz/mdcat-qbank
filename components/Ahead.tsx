/* Asks the browser to get the sign-in and sign-up pages ready before they are clicked: fetched as soon as this page is
   idle, and built in the background once a link to one is pointed at or pressed, so the click only has to show it.
   Browsers that don't know these rules ignore them. Only public pages are named; inside the app, moving between pages
   is handled by components/Nav.tsx. */
const pages = ["/signup", "/signin", "/signup?*", "/signin?*", "/pricing", "/forgot-password"];
const rules = {
  prefetch: [{ urls: ["/signup", "/signin"], eagerness: "eager" }],
  prerender: [{ where: { href_matches: pages }, eagerness: "moderate" }],
};

export default function Ahead() {
  return <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(rules) }} />;
}

/* The same for the study pages, which are plain pages: any public page a visitor points at or presses is built in
   the background, so moving from chapter to chapter, or on to sign-up, shows at once. */
const reading = ["/mdcat", "/mdcat/*", "/guides", "/guides/*", "/nums-mdcat", "/aku-test", "/about"];
const readingRules = { prerender: [{ where: { href_matches: reading }, eagerness: "moderate" }] };

export function AheadReading() {
  return <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(readingRules) }} />;
}
