/* What a list or screen shows when there is nothing in it yet: a short title, one line on why, and an optional next step. */
export default function Empty({ title, text, children }: { title: string; text?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="nothing">
      <b>{title}</b>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
