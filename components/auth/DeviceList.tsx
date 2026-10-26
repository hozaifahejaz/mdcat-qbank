import type { Device } from "@/lib/auth";

function DeviceIcon({ label }: { label: string }) {
  const phone = /iPhone|Android|iPad/.test(label);
  return phone ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M11 18.5h2" /></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></svg>
  );
}

const when = (iso: string) => new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

/* The account's registered devices, each with an optional action button (Remove). */
export default function DeviceList({ devices, action }: { devices: Device[]; action?: (d: Device) => React.ReactNode }) {
  return (
    <ul className="device-list">
      {devices.map((d) => (
        <li key={d.id}>
          <span className="ic"><DeviceIcon label={d.label} /></span>
          <span>
            <b>{d.label}{d.active && <span className="here">Active</span>}</b>
            <small>Added {when(d.created_at)} · last used {when(d.last_seen_at)}</small>
          </span>
          {action ? action(d) : <span />}
        </li>
      ))}
    </ul>
  );
}
