"use client";

import { useEffect, useState } from "react";
import Turnstile from "@/components/auth/Turnstile";
import { api, getAuthConfig, lastAuthConfig } from "@/lib/api";
import { friendlyError } from "@/lib/auth";
import { MESSAGE_MAX, MESSAGE_MIN, TICKET_EMAILS, type TopicId, topicLabel, topics } from "@/lib/support";
import { getCurrentUser, lastUser } from "@/lib/user";
import { when } from "@/components/support/Thread";

type Mine = { id: number; topic: string; status: "open" | "closed"; answered: boolean; createdAt: number; updatedAt: number };

/* The contact form. Each message becomes a support ticket; the reply comes by email, with a link to the whole
   conversation. Signed in, the name and email are filled in and earlier tickets are listed. */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<TopicId>("account");
  const [text, setText] = useState("");
  const [trap, setTrap] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [siteKey, setSiteKey] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<{ id: number; link: string; email: string } | null>(null);
  const [mine, setMine] = useState<Mine[]>([]);

  useEffect(() => {
    // ?topic=payment and friends, from links elsewhere on the site.
    const asked = new URLSearchParams(window.location.search).get("topic");
    if (topics.some((t) => t.id === asked)) setTopic(asked as TopicId);
    const fill = (u: { name: string; email?: string } | null) => {
      if (!u) return;
      setName((n) => n || u.name);
      setEmail((e) => e || u.email || "");
    };
    const seen = lastUser();
    fill(seen);
    if (seen) setSignedIn(true);
    getCurrentUser().then((u) => {
      setSignedIn(!!u);
      fill(u);
      if (u) api<{ tickets: Mine[] }>("/api/support/mine").then((r) => setMine(r.tickets), () => {});
      // Signed in, the account is the check; signed out, the same check as sign-up.
      else { setSiteKey(lastAuthConfig().turnstileSiteKey); getAuthConfig().then((c) => setSiteKey(c?.turnstileSiteKey ?? "")); }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Please enter a valid email address, so we can reply.");
    if (text.trim().length < MESSAGE_MIN) return setError("Please write a little more so we can help.");
    if (!signedIn && siteKey && !captcha) return setError("Please complete the check above.");
    setBusy(true); setError("");
    const token = captcha;
    setCaptchaReset((n) => n + 1);
    try {
      const r = await api<{ id: number; link: string }>("/api/support", { body: { name: name.trim(), email: email.trim().toLowerCase(), topic, message: text, captcha: token, website: trap } });
      setSent({ id: r.id, link: r.link, email: email.trim() });
      setText("");
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="stack-16">
        <p className="note-good" role="status">
          Message sent{sent.id ? <>, your ticket number is <b>#{sent.id}</b></> : ""}.
          {TICKET_EMAILS
            ? <> We&apos;ll reply to <b>{sent.email}</b>, usually within one working day.{sent.link && " Save your ticket's link below to see the conversation or add to it."}</>
            : <> Our answer will be on your ticket page, usually within one working day. {signedIn ? "You'll find it on this page, under your earlier messages." : "Open it below and bookmark it, so you can come back to it."}</>}
        </p>
        <div className="role-row">
          {sent.link && <a className="dpill dark small" href={sent.link}>See your ticket</a>}
          <button type="button" className="dpill light small" onClick={() => setSent(null)}>Send another message</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form className="support-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <label className="fld"><span>Your name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required disabled={busy} /></label>
          <label className="fld"><span>Email</span><input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} placeholder="you@example.com" required disabled={busy} /></label>
          <label className="fld span2">
            <span>What is it about?</span>
            <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId)} disabled={busy}>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          <label className="fld span2">
            <span>Message</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={MESSAGE_MAX} required disabled={busy}
              placeholder={topic === "question" ? "Which question (the ID under it, like BIO-0123) and what looks wrong?" : topic === "payment" ? "When you paid, how you paid, and what went wrong." : "How can we help?"} />
          </label>
          {/* Left empty by people; hidden from them and from screen readers. */}
          <label className="hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
        </div>
        {!signedIn && <Turnstile siteKey={siteKey} onToken={setCaptcha} resetKey={captchaReset} />}
        {error && <p className="note-bad" role="alert">{error}</p>}
        <div><button className="dpill dark" disabled={busy}>{busy ? "Sending…" : "Send message"}</button></div>
      </form>

      {mine.length > 0 && (
        <section className="support-mine">
          <h2>Your earlier messages</h2>
          <ul>
            {mine.map((t) => (
              <li key={t.id}>
                <a href={`/contact/ticket?id=${t.id}`}>#{t.id} · {topicLabel(t.topic)}</a>
                <span className="muted small">{t.status === "closed" ? "Closed" : t.answered ? "Answered" : "Waiting for us"} · {when(t.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
