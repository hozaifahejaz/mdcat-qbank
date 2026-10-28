"use client";

import { useEffect, useRef, useState } from "react";

/* Fades its children up once they scroll into view. Anything already on screen at load shows straight away. */
export default function Rise({ as: Tag = "div", className = "", delay = 0, style, children }: {
  as?: "div" | "li"; className?: string; delay?: number; style?: React.CSSProperties; children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [wait, setWait] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || el.getBoundingClientRect().top < innerHeight * 0.92) return;
    setWait(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setWait(false); io.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`bx-rise${wait ? " wait" : ""} ${className}`.trim()} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
