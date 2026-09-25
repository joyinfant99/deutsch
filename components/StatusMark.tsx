import type { Status } from "@/lib/progress";

export default function StatusMark({ status, className = "" }: { status: Status; className?: string }) {
  if (status === "done") {
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Completed">
        <circle cx="24" cy="24" r="21" fill="var(--good)" />
        <path d="M14 25l7 7 13-15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "missed") {
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Missed">
        <path d="M10 10l28 28M38 10L10 38" fill="none" stroke="var(--bad)" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "partial") {
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label="In progress">
        <circle cx="24" cy="24" r="19" fill="none" stroke="var(--half)" strokeWidth="4" />
        <path d="M24 5a19 19 0 0 0 0 38z" fill="var(--half)" />
      </svg>
    );
  }
  if (status === "today") {
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Today">
        <circle cx="24" cy="24" r="19" fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray="4 6" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}
