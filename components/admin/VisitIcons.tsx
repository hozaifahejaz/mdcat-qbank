/* Small marks for the admin Visitors page: browsers, systems, devices, sources and country flags. Drawn here as
   simple shapes, so the page loads nothing from other sites. Each is a 24 x 24 square, or a 24 x 16 flag. */

type P = { k: string };

const Globe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9M12 3C9.4 5.6 8.2 8.6 8.2 12s1.2 6.4 3.8 9" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 19 19 5M9 5h10v10" />
  </svg>
);
const Tile = ({ bg, fg = "#fff", text, round = 6, size = 11 }: { bg: string; fg?: string; text: string; round?: number; size?: number }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx={round} fill={bg} />
    <text x="12" y="12.5" dominantBaseline="middle" textAnchor="middle" fill={fg} fontSize={size} fontWeight="800" fontFamily="system-ui, sans-serif">{text}</text>
  </svg>
);

const Chrome = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12 2.47 6.5A11 11 0 0 1 21.53 6.5Z" fill="#ea4335" />
    <path d="M12 12 21.53 6.5A11 11 0 0 1 12 23Z" fill="#fbbc04" />
    <path d="M12 12 12 23A11 11 0 0 1 2.47 6.5Z" fill="#34a853" />
    <circle cx="12" cy="12" r="5.2" fill="#fff" /><circle cx="12" cy="12" r="4" fill="#4285f4" />
  </svg>
);
const Apple = ({ color = "currentColor" }: { color?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill={color} d="M12 7.6c-1.3-1-3.4-1.5-5-.5-1.8 1.1-2.6 3.4-2.1 6 .5 2.9 2.4 6.2 4.3 6.4.9.1 1.6-.5 2.8-.5s1.9.6 2.8.5c1.5-.1 2.9-2.1 3.7-4.2-1.7-.8-2.6-2.4-2.4-4.2.1-1.2.8-2.2 1.7-2.8-1.6-1.9-4.3-1.9-5.8-.7Z" />
    <path fill={color} d="M12.1 6.6c-.1-2 1.4-3.6 3.3-3.8.2 2-1.4 3.7-3.3 3.8Z" />
  </svg>
);
const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" />
  </svg>
);
const Tablet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M11 18h2" />
  </svg>
);
const Desktop = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6M12 16v4" />
  </svg>
);

const browsers: Record<string, () => React.ReactElement> = {
  Chrome,
  Safari: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1b88f3" /><circle cx="12" cy="12" r="8.6" fill="none" stroke="#fff" strokeWidth=".9" strokeDasharray="1 1.6" />
      <path d="M17.6 6.4 13.2 13.2 10.8 10.8Z" fill="#ff3b30" /><path d="M6.4 17.6 10.8 10.8 13.2 13.2Z" fill="#fff" />
    </svg>
  ),
  Firefox: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ff7139" /><circle cx="13" cy="12.6" r="6.4" fill="#7542e5" />
      <path d="M3.6 8.4c1.4 1 3.4 1 4.6.2-.4 2 .4 4 2.2 5.1" fill="none" stroke="#ffbd4f" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Edge: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#0c88d4" />
      <path d="M5 13.5c0-4 3.2-6.8 7-6.8 3.6 0 6.2 2.4 6.2 5.4 0 1.8-1.4 2.9-3.4 2.9H9.4c.3 2 2 3.4 4.4 3.4 1.4 0 2.8-.4 3.8-1.2-1.2 2.3-3.6 3.6-6.2 3.6C7.6 20.8 5 17.6 5 13.5Z" fill="#50e6a0" />
      <path d="M9.5 12.3c.3-1.8 1.7-3 3.4-3s3 1.2 3 3Z" fill="#0c88d4" />
    </svg>
  ),
  Opera: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="8" ry="9.4" fill="none" stroke="#ff1b2d" strokeWidth="4.4" />
    </svg>
  ),
  "Samsung Internet": () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#6c4cf5" /><circle cx="12" cy="12" r="4.6" fill="#fff" />
      <ellipse cx="12" cy="12" rx="9" ry="3" fill="none" stroke="#fff" strokeWidth="1.4" transform="rotate(-25 12 12)" />
    </svg>
  ),
  "UC Browser": () => <Tile bg="#ff6a00" text="UC" size={9} />,
  "Facebook or Instagram app": () => <Facebook />,
};

const Facebook = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#1877f2" />
    <path fill="#fff" d="M13.4 23v-7.9h2.6l.4-3h-3V10.2c0-.9.3-1.5 1.5-1.5h1.6V6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V23Z" />
  </svg>
);

const systems: Record<string, () => React.ReactElement> = {
  Android: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 18a8.5 8.5 0 0 1 17 0Z" fill="#3ddc84" />
      <path d="M6.5 9.6 4.8 6.8M17.5 9.6l1.7-2.8" stroke="#3ddc84" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8.6" cy="14.2" r="1.1" fill="#0b2e1a" /><circle cx="15.4" cy="14.2" r="1.1" fill="#0b2e1a" />
    </svg>
  ),
  iOS: () => <Apple />,
  macOS: () => <Apple />,
  Windows: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#0078d4" d="M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z" />
    </svg>
  ),
  Linux: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="13" rx="6.5" ry="8.5" fill="#1f2328" /><ellipse cx="12" cy="15" rx="4.2" ry="5.6" fill="#fff" />
      <circle cx="10.3" cy="8.4" r=".9" fill="#fff" /><circle cx="13.7" cy="8.4" r=".9" fill="#fff" />
      <path d="M10.4 10.2h3.2L12 11.8Z" fill="#f5b400" /><ellipse cx="8.4" cy="21" rx="2.6" ry="1.2" fill="#f5b400" /><ellipse cx="15.6" cy="21" rx="2.6" ry="1.2" fill="#f5b400" />
    </svg>
  ),
  ChromeOS: Chrome,
};

const devices: Record<string, () => React.ReactElement> = { phone: Phone, tablet: Tablet, desktop: Desktop };

/* Sources by host. The first match wins. */
const sources: [RegExp, string, () => React.ReactElement][] = [
  [/(^|\.)google\./, "Google", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" fill="#4285f4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34a853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9Z" fill="#fbbc04" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.9 9.9 0 0 0 3.1 7.4L6.4 10C7.2 7.6 9.4 5.9 12 5.9Z" fill="#ea4335" />
    </svg>
  )],
  [/(^|\.)bing\.com$/, "Bing", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5 10 4v11.3l4.6-2.7-2.3-1.1-1.4-3.2 8.4 2.9v4.3L10 21.5l-4-2.2Z" fill="#0f9d8f" /></svg>
  )],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook", Facebook],
  [/(^|\.)instagram\.com$/, "Instagram", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs><linearGradient id="vi-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#fd5" /><stop offset=".5" stopColor="#ff543e" /><stop offset="1" stopColor="#c837ab" /></linearGradient></defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#vi-ig)" />
      <rect x="6" y="6" width="12" height="12" rx="3.6" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="15.6" cy="8.4" r=".9" fill="#fff" />
    </svg>
  )],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.5" y="5" width="21" height="14" rx="4.5" fill="#ff0000" /><path d="M10 8.8v6.4l5.4-3.2Z" fill="#fff" /></svg>
  )],
  [/^(t\.co|x\.com|twitter\.com)$/, "X (Twitter)", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="6" fill="#0f1115" /><path d="M7 7h2.8l7.2 10h-2.8ZM16.6 7 7.4 17" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinejoin="round" /></svg>
  )],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z" fill="#25d366" />
      <path d="M9 7.6c.3 0 .6 0 .8.5l.8 1.8c.1.3 0 .6-.2.8l-.6.7c.6 1.3 1.7 2.4 3 3l.7-.7c.2-.2.5-.3.8-.2l1.8.8c.4.2.5.5.5.8 0 1-.8 2-2 2-3.2 0-7-3.6-7-7 0-1.2 1-2.5 1.4-2.5Z" fill="#fff" />
    </svg>
  )],
  [/(^|\.)tiktok\.com$/, "TikTok", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#0f1115" />
      <path d="M13.2 5.5v8.6a2.5 2.5 0 1 1-2.5-2.5M13.2 5.5c.3 1.9 1.6 3.2 3.6 3.4" fill="none" stroke="#25f4ee" strokeWidth="1.8" strokeLinecap="round" transform="translate(-.6 -.4)" />
      <path d="M13.2 5.5v8.6a2.5 2.5 0 1 1-2.5-2.5M13.2 5.5c.3 1.9 1.6 3.2 3.6 3.4" fill="none" stroke="#fe2c55" strokeWidth="1.8" strokeLinecap="round" transform="translate(.6 .4)" />
      <path d="M13.2 5.5v8.6a2.5 2.5 0 1 1-2.5-2.5M13.2 5.5c.3 1.9 1.6 3.2 3.6 3.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )],
  [/(^|\.)reddit\.com$/, "Reddit", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#ff4500" /><ellipse cx="12" cy="14" rx="6.4" ry="4.4" fill="#fff" />
      <circle cx="9.6" cy="13.4" r="1" fill="#ff4500" /><circle cx="14.4" cy="13.4" r="1" fill="#ff4500" /><circle cx="15.8" cy="6.4" r="1.2" fill="#fff" /><path d="M12 9.6 13 5.6l2.8.8" stroke="#fff" strokeWidth=".9" fill="none" />
    </svg>
  )],
  [/(^|\.)linkedin\.com$/, "LinkedIn", () => <Tile bg="#0a66c2" text="in" round={4} size={11} />],
  [/(^|\.)(duckduckgo\.com)$/, "DuckDuckGo", () => <Tile bg="#de5833" text="D" round={11} />],
  [/(^|\.)yahoo\./, "Yahoo", () => <Tile bg="#6001d2" text="y!" round={11} size={10} />],
  [/(^|\.)(t\.me|telegram\.org)$/, "Telegram", () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#229ed9" /><path d="m5.6 11.6 11.2-4.4c.5-.2 1 .1.8.9l-1.9 9c-.1.6-.5.8-1 .5l-2.9-2.1-1.4 1.3c-.2.2-.3.2-.6.2l.2-3 5.4-4.9c.2-.2 0-.3-.3-.1l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.1-.7Z" fill="#fff" /></svg>
  )],
];

export const sourceName = (h: string) => (h ? sources.find(([re]) => re.test(h))?.[1] ?? h : "Direct or unknown");
export function SourceMark({ k }: P) {
  if (!k) return <Arrow />;
  const s = sources.find(([re]) => re.test(k));
  return s ? s[2]() : <Globe />;
}
export const BrowserMark = ({ k }: P) => (browsers[k] ?? Globe)();
export const SystemMark = ({ k }: P) => (systems[k] ?? Globe)();
export const DeviceMark = ({ k }: P) => (devices[k] ?? Desktop)();

/* Flags for the countries most visits come from; any other shows its two-letter code. */
const flags: Record<string, React.ReactElement> = {
  PK: (<><rect width="24" height="16" fill="#01411c" /><rect width="6" height="16" fill="#fff" /><circle cx="15.2" cy="8" r="4.4" fill="#fff" /><circle cx="16.4" cy="7.1" r="3.8" fill="#01411c" /><path d="m18.6 4.8.4 1.1h1.2l-1 .7.4 1.1-1-.7-1 .7.4-1.1-1-.7h1.2Z" fill="#fff" /></>),
  AE: (<><rect width="24" height="16" fill="#00732f" /><rect y="5.33" width="24" height="5.34" fill="#fff" /><rect y="10.67" width="24" height="5.33" fill="#000" /><rect width="6.5" height="16" fill="#ff0000" /></>),
  SA: (<><rect width="24" height="16" fill="#006c35" /><path d="M6 6.2h12M6 8h12" stroke="#fff" strokeWidth=".9" strokeDasharray="1.2 .6" /><path d="M7 11h10" stroke="#fff" strokeWidth=".9" /></>),
  QA: (<><rect width="24" height="16" fill="#8a1538" /><path d="M0 0h7l2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9-2 .9 2 .9H0Z" fill="#fff" /></>),
  OM: (<><rect width="24" height="16" fill="#db161b" /><rect x="7" width="17" height="5.33" fill="#fff" /><rect x="7" y="10.67" width="17" height="5.33" fill="#008000" /></>),
  KW: (<><rect width="24" height="16" fill="#fff" /><rect width="24" height="5.33" fill="#007a3d" /><rect y="10.67" width="24" height="5.33" fill="#ce1126" /><path d="M0 0l6 5.33v5.34L0 16Z" fill="#000" /></>),
  BH: (<><rect width="24" height="16" fill="#ce1126" /><path d="M0 0h7l2.4 1.6L7 3.2l2.4 1.6L7 6.4 9.4 8 7 9.6l2.4 1.6L7 12.8l2.4 1.6L7 16H0Z" fill="#fff" /></>),
  GB: (<><rect width="24" height="16" fill="#012169" /><path d="M0 0l24 16M24 0 0 16" stroke="#fff" strokeWidth="3.2" /><path d="M0 0l24 16M24 0 0 16" stroke="#c8102e" strokeWidth="1.2" /><path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" /><path d="M12 0v16M0 8h24" stroke="#c8102e" strokeWidth="3" /></>),
  US: (<><rect width="24" height="16" fill="#fff" />{[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} y={(i * 16) / 13} width="24" height={16 / 13} fill="#b22234" />)}<rect width="10.4" height="8.6" fill="#3c3b6e" /></>),
  CA: (<><rect width="24" height="16" fill="#fff" /><rect width="6" height="16" fill="#d80621" /><rect x="18" width="6" height="16" fill="#d80621" /><path d="M12 3.4l1 2 1.4-.6-.4 3 1.6-1.2.6 1.2 1.2-.2-.6 2 .8.6-3.2 1.4.3 1.4H12.3V15h-.6v-2h-2.4l.3-1.4-3.2-1.4.8-.6-.6-2 1.2.2.6-1.2L10 8.4l-.4-3 1.4.6Z" fill="#d80621" /></>),
  IN: (<><rect width="24" height="16" fill="#fff" /><rect width="24" height="5.33" fill="#ff9933" /><rect y="10.67" width="24" height="5.33" fill="#138808" /><circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth=".7" /></>),
  AF: (<><rect width="8" height="16" fill="#000" /><rect x="8" width="8" height="16" fill="#d32011" /><rect x="16" width="8" height="16" fill="#007a36" /></>),
  CN: (<><rect width="24" height="16" fill="#ee1c25" /><path d="m4.8 2.4.9 2.7h2.8l-2.3 1.7.9 2.7-2.3-1.7-2.3 1.7.9-2.7-2.3-1.7h2.8Z" fill="#ff0" /></>),
  DE: (<><rect width="24" height="5.33" fill="#000" /><rect y="5.33" width="24" height="5.34" fill="#dd0000" /><rect y="10.67" width="24" height="5.33" fill="#ffce00" /></>),
  TR: (<><rect width="24" height="16" fill="#e30a17" /><circle cx="9" cy="8" r="4" fill="#fff" /><circle cx="10" cy="8" r="3.2" fill="#e30a17" /><path d="m14.4 8 2.6-.9-1.6 2.2V6.7l1.6 2.2Z" fill="#fff" /></>),
  MY: (<><rect width="24" height="16" fill="#fff" />{[0, 2, 4, 6, 8, 10, 12].map((i) => <rect key={i} y={(i * 16) / 14} width="24" height={16 / 14} fill="#cc0001" />)}<rect width="12" height="9.1" fill="#010066" /><circle cx="5" cy="4.6" r="2.8" fill="#fc0" /><circle cx="5.8" cy="4.6" r="2.3" fill="#010066" /></>),
  AU: (<><rect width="24" height="16" fill="#012169" /><path d="M0 0l10 7M10 0 0 7" stroke="#fff" strokeWidth="1.6" /><path d="M5 0v7M0 3.5h10" stroke="#fff" strokeWidth="2.4" /><path d="M5 0v7M0 3.5h10" stroke="#c8102e" strokeWidth="1.2" /><circle cx="5" cy="12" r="1.4" fill="#fff" /><circle cx="18" cy="4" r=".8" fill="#fff" /><circle cx="20" cy="8" r=".8" fill="#fff" /><circle cx="16.4" cy="9" r=".8" fill="#fff" /><circle cx="18" cy="13" r=".8" fill="#fff" /></>),
};

export function Flag({ k }: P) {
  if (!/^[A-Z]{2}$/.test(k) || k === "XX" || k === "T1") return <span className="vflag none"><Globe /></span>;
  const f = flags[k];
  return f
    ? <span className="vflag"><svg viewBox="0 0 24 16" aria-hidden="true" preserveAspectRatio="xMidYMid slice">{f}</svg></span>
    : <span className="vflag code" aria-hidden="true">{k}</span>;
}
