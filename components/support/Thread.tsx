import type { TicketMessage } from "@/lib/support";

/* Dates in Pakistan time, whatever the device says. */
export const when = (ms: number) => new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });

/* A support conversation, oldest first. The team's messages are set apart from the person's. */
export default function Thread({ messages }: { messages: TicketMessage[] }) {
  return (
    <ol className="tk-thread">
      {messages.map((m) => (
        <li key={m.id} className={`tk-msg${m.fromStaff ? " staff" : ""}`}>
          <div className="tk-meta"><b>{m.author}</b><span>{when(m.createdAt)}</span></div>
          <p>{m.body}</p>
        </li>
      ))}
    </ol>
  );
}
