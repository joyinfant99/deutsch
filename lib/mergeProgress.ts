import type { Attempt, DayProgress, Progress } from "./types";

export function mergeProgress(local: Progress, cloud: Progress): Progress {
  const days: Progress["days"] = {};
  const keys = new Set([...Object.keys(local.days), ...Object.keys(cloud.days)]);
  for (const k of keys) {
    const a: DayProgress | undefined = local.days[k];
    const b: DayProgress | undefined = cloud.days[k];
    if (!a || !b) {
      days[k] = (a ?? b)!;
      continue;
    }
    const seen = new Map<string, Attempt>();
    for (const at of [...b.attempts, ...a.attempts]) seen.set(at.at, at);
    const attempts = [...seen.values()].sort((x, y) => x.at.localeCompare(y.at));
    const completed = [a.completedAt, b.completedAt].filter(Boolean) as string[];
    days[k] = {
      checked: [...new Set([...b.checked, ...a.checked])],
      attempts,
      best: Math.max(a.best, b.best),
      ...(completed.length ? { completedAt: completed.sort()[0] } : {}),
    };
  }
  return { startDate: cloud.startDate || local.startDate, days };
}
