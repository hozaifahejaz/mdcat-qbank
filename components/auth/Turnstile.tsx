"use client";

import { useEffect, useRef } from "react";
import { turnstileSiteKey } from "@/lib/supabase";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi; } }

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; reject(new Error("captcha failed to load")); };
    document.head.appendChild(s);
  });
  return loading;
}

/* Cloudflare Turnstile. Renders nothing when no site key is set. Tokens are single use, so the parent bumps
   `resetKey` after every request that spent one. */
export default function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!turnstileSiteKey || !box.current) return;
    let gone = false;
    loadScript().then(() => {
      if (gone || !box.current || !window.turnstile) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: turnstileSiteKey,
        theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
        size: "flexible",
        callback: (t: string) => cb.current(t),
        "expired-callback": () => cb.current(""),
        "error-callback": () => cb.current(""),
      });
    }).catch(() => {});
    return () => {
      gone = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && widget.current && window.turnstile) {
      cb.current("");
      window.turnstile.reset(widget.current);
    }
  }, [resetKey]);

  if (!turnstileSiteKey) return null;
  return <div ref={box} />;
}

export const captchaOn = Boolean(turnstileSiteKey);
