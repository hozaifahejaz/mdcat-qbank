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
