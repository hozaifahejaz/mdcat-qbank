/* Line icons for the signed-in app, 24px grid, drawn in currentColor. */
const paths: Record<string, React.ReactNode> = {
  home: <><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></>,
  practice: <><path d="M5 4.5h10.5L19 8v11.5H5z" /><path d="M9 11.5l2 2 4-4" /></>,
  mock: <><circle cx="12" cy="13" r="7" /><path d="M12 9.5V13l2.5 1.5M10 3h4" /></>,
  paper: <><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5V8h4M9 12h6M9 15.5h6" /></>,
  mistakes: <><circle cx="12" cy="12" r="8" /><path d="m9.5 9.5 5 5m0-5-5 5" /></>,
  results: <><path d="M4 20h16M7 16v-4M12 16V8M17 16v-6" /></>,
  billing: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h3" /></>,
  account: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1.2-3.2 3.8-4.8 7-4.8s5.8 1.6 7 4.8" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.6M12 17h.01" /></>,
  signout: <><path d="M14 4.5H6.5v15H14M10.5 12H20m-3-3 3 3-3 3" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  spark: <><path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5z" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".6" /></>,
  check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.2 2.4 2.4 4.6-4.8" /></>,
  bolt: <><path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z" /></>,
  play: <><path d="M8 5.5v13l10-6.5z" /></>,
  retry: <><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4" /></>,
  panel: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M14.5 4.5v15" /></>,
  chevron: <><path d="m9 6 6 6-6 6" /></>,
  shield: <><path d="M12 3.5 5 6.5v5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9v-5z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  flame: <><path d="M12 3.5c.5 3-2.5 4.5-2.5 7.5a2.5 2.5 0 0 0 5 0c0-1-.5-1.8-1-2.5 2.5 1 4 3.6 4 6a5.5 5.5 0 0 1-11 0c0-4.5 4-6.5 5.5-11z" /></>,
};

export default function Icon({ name, size = 18 }: { name: keyof typeof paths | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
