import type { ReactNode } from "react";

/* Subscripts and superscripts in question text. The bank writes them as _{…} and ^{…} (X_{C}, k_{B}T, e^{−t/RC}),
   which can nest (e^{−ΔE/k_{B}T}). Everything else is shown exactly as written. */
export function rich(s: string | null | undefined): ReactNode {
  if (!s) return s ?? "";
  if (!s.includes("_{") && !s.includes("^{")) return s;
  let key = 0;
  const walk = (i: number, inner: boolean): [ReactNode[], number] => {
    const out: ReactNode[] = [];
    let text = "";
    while (i < s.length) {
      const c = s[i]!;
      if (inner && c === "}") break;
      if ((c === "_" || c === "^") && s[i + 1] === "{") {
        const [kids, end] = walk(i + 2, true);
        if (end >= s.length) { text += s.slice(i); i = s.length; break; } // no closing brace: leave it as text
        if (text) { out.push(text); text = ""; }
        out.push(c === "_" ? <sub key={key++}>{kids}</sub> : <sup key={key++}>{kids}</sup>);
        i = end + 1;
        continue;
      }
      text += c;
      i++;
    }
    if (text) out.push(text);
    return [out, i];
  };
  return walk(0, false)[0];
}

