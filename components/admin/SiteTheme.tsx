"use client";

import { useEffect, useState } from "react";
import { PageHead } from "@/components/app/AppShell";
import { friendlyError } from "@/lib/auth";
import { getLook, setLook } from "@/lib/admin";
import { type Look, lookNames, looks } from "@/lib/look";

/* /admin/site — which look the landing page and the sign-in screens use. Both designs stay in the site, so switching
   back is one click. Visitors see the change within about half a minute (server/look.ts). */
export default function SiteTheme() {
  const [look, setNow] = useState<Look | null>(null);
  const [busy, setBusy] = useState<Look | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { getLook().then(setNow, (e) => setMsg({ ok: false, text: friendlyError(e) })); }, []);

  async function pick(l: Look) {
    setBusy(l);
    setMsg(null);
    try {
      setNow(await setLook(l));
      setMsg({ ok: true, text: `${lookNames[l].name} is now live. Visitors see it within about half a minute.` });
    } catch (e) {
      setMsg({ ok: false, text: friendlyError(e) });
    }
    setBusy(null);
  }

  return (
    <div className="dgrid">
      <PageHead title="Site theme" sub="The design of the landing page and the sign-in pages. Light and dark mode work in both." />
      {msg && <p className={msg.ok ? "note-good" : "note-bad"} role="status">{msg.text}</p>}
      <div className="look-grid">
        {looks.map((l) => (
          <section key={l} className={`dcard panel look-card${look === l ? " on" : ""}`}>
            <div className="look-thumb" data-l={l} aria-hidden="true"><i /><i /><i /><b /></div>
            <div className="look-copy">
              <h2>{lookNames[l].name}{look === l && <span className="look-live">Live</span>}</h2>
              <p className="muted">{lookNames[l].blurb}</p>
            </div>
            <div className="look-actions">
              <a className="dpill light small" href={`/?look=${l}`} target="_blank" rel="noopener">Preview landing</a>
              <a className="dpill light small" href={`/signin?look=${l}`} target="_blank" rel="noopener">Preview sign-in</a>
              {look && look !== l && (
                <button type="button" className="dpill dark small" disabled={!!busy} onClick={() => pick(l)}>
                  {busy === l ? "Switching…" : `Use ${lookNames[l].name}`}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
