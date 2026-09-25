import type { Progress } from "./types";
import { addDays } from "./dates";

export type Status = "done" | "partial" | "missed" | "today" | "future";

export function statusFor(progress: Progress, today: string, n: number): Status {
  const d = progress.days[n];
  if (d?.completedAt) return "done";
  if (!today) return "future";
  const date = addDays(progress.startDate, n - 1);
  if (date > today) return "future";
  if (d && (d.checked.length > 0 || d.attempts.length > 0)) return "partial";
  if (date === today) return "today";
  return "missed";
}
