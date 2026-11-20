/* Runs after `next build`: turns the public study pages into plain pages with no framework script.

   A study page (components/public/Shell.tsx) is text, links and questions that open with <details>; the only things
   on it that need script are the light/dark button and the page count. The framework's files (about 170 KB
   compressed) and the copy of the page it carries for them are taken out, and a few lines stand in for those two.
   A page opts in by being marked data-plain; one with a live part of its own (the aggregate calculator) is not marked
   and is left exactly as built. */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? (f === "_next" ? [] : walk(p)) : [p]; });

/* The same behaviour as components/ThemeToggle.tsx and components/Track.tsx. */
const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const small = `(function(){var h=document.documentElement,S=${JSON.stringify(sun)},M=${JSON.stringify(moon)};
function draw(){var d=h.getAttribute("data-theme")==="dark",l=d?"Switch to light mode":"Switch to dark mode";document.querySelectorAll(".theme-toggle").forEach(function(b){b.innerHTML=d?S:M;b.setAttribute("aria-pressed",d?"true":"false");b.setAttribute("aria-label",l);b.title=l})}
draw();
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".theme-toggle");if(!b)return;var n=h.getAttribute("data-theme")==="dark"?"light":"dark";h.setAttribute("data-theme",n);try{localStorage.setItem("theme",n)}catch(x){}var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",n==="dark"?"#0f1012":"#f4f4f1");draw()});
function count(){var q=new URLSearchParams(location.search),p=location.pathname.length>1?location.pathname.replace(/\\/+$/,""):"/";var send=function(){fetch("/api/visit",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({path:p,referrer:document.referrer,campaign:q.get("utm_source")||q.get("ref")||""}),keepalive:true,credentials:"same-origin"}).catch(function(){})};if(window.requestIdleCallback)requestIdleCallback(send,{timeout:3000});else setTimeout(send,800)}
if(document.prerendering)document.addEventListener("prerenderingchange",count,{once:true});else count()})();`;

let n = 0, saved = 0;
for (const file of walk(OUT).filter((f) => f.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (!html.includes(' data-plain="')) continue;
  let out = html
    // The framework's files, and the hints to fetch them early.
    .replace(/<script\b[^>]*\bsrc="\/_next\/[^"]+"[^>]*><\/script>/g, "")
    .replace(/<link\b[^>]*\brel="preload"[^>]*\bas="script"[^>]*\/?>/g, "")
    // The framework's own inline scripts: its loader list and the copy of the page it reads back.
    .replace(/<script\b[^>]*>(?:\(globalThis\["TURBOPACK"\]|\(self\.__next_f=|self\.__next_f\.push\()[\s\S]*?<\/script>/g, "");
  if (/_next\/static\/[^"]+\.js|__next_f/.test(out)) throw new Error(`build-light: ${file} still asks for the framework`);
  if (!out.includes("</body>")) throw new Error(`build-light: ${file} has no end of body`);
  out = out.replace("</body>", `<script>${small}</script></body>`);
  writeFileSync(file, out);
  n++; saved += html.length - out.length;
}
if (n < 20) throw new Error(`build-light: only ${n} study pages found, which cannot be right`);
console.log(`plain pages: ${n} study pages without framework script (${Math.round(saved / n / 1024)} KB lighter each, before the script files)`);
