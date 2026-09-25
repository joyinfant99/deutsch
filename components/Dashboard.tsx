"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ScheduleItem } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import { MONTHS, WEEKDAYS, fromISO, toISO, addDays, niceDate } from "@/lib/dates";
import StatusMark from "./StatusMark";

const PHASE_COLOR: Record<string, string> = { a1: "var(--a1)", a2: "var(--a2)", b1: "var(--b1)", exam: "var(--exam)" };

export default function Dashboard({ schedule }: { schedule: ScheduleItem[] }) {
  const { ready, progress, today, dateOf, dayNumberOf, statusOf } = useProgress();
  const total = schedule.length;
  const start = progress.startDate;
  const end = dateOf(total);

  const todayN = today ? dayNumberOf(today) : 0;
  const initial = today && today >= start && today <= end ? today : start;
  const [view, setView] = useState<string | null>(null);
  const viewISO = view ?? initial;
  const vd = fromISO(viewISO);
  const year = vd.getFullYear();
  const month = vd.getMonth();

  const cells = useMemo(() => {
    const first = new Date(year, month, 1, 12);
    const offset = (first.getDay() + 6) % 7;
    const gridStart = toISO(new Date(year, month, 1 - offset, 12));
    return Array.from({ length: 42 }, (_, i) => {
      const iso = addDays(gridStart, i);
      const n = dayNumberOf(iso);
      const inCourse = n >= 1 && n <= total;
      return { iso, n, inCourse, inMonth: fromISO(iso).getMonth() === month };
    });
  }, [year, month, dayNumberOf, total]);

  // Only weeks that contain course days are shown, so cells stay square instead of stretching.
  const weekRows = useMemo(() => {
    const rows = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
    const used = rows.filter((row) => row.some((c) => c.inCourse));
    return used.length ? used : rows;
  }, [cells]);
  const weeks = useMemo(() => weekRows.flat(), [weekRows]);

  const goMonth = (delta: number) => setView(toISO(new Date(year, month + delta, 1, 12)));
  const minView = fromISO(start);
  const maxView = fromISO(end);
  const canPrev = year * 12 + month > minView.getFullYear() * 12 + minView.getMonth();
  const canNext = year * 12 + month < maxView.getFullYear() * 12 + maxView.getMonth();

  const doneCount = schedule.filter((s) => statusOf(s.n) === "done").length;
  const scores = Object.values(progress.days).filter((d) => d.completedAt).map((d) => d.best);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const catchUp = schedule.filter((s) => {
    const st = statusOf(s.n);
    return st === "missed" || (st === "partial" && dateOf(s.n) < today);
  });

  const todayItem = todayN >= 1 && todayN <= total ? schedule[todayN - 1] : null;
  const todayStatus = todayItem ? statusOf(todayItem.n) : null;
  const todayBest = todayItem ? progress.days[todayItem.n]?.best : undefined;

  return (
    <main className="grid flex-1 gap-4 px-4 py-4 sm:gap-5 sm:px-8 sm:py-5 lg:h-dvh lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_minmax(0,1fr)]">
      <section className="order-2 flex min-w-0 flex-col rounded-3xl border border-line bg-card p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-5 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="serif whitespace-nowrap text-xl sm:text-4xl">
            {MONTHS[month]} <em>{year}</em>
          </h1>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setView(initial)}
              className="rounded-full border border-line px-3.5 py-2 text-sm text-muted hover:text-ink"
            >
              Today
            </button>
            <button
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => goMonth(-1)}
              className="grid size-9 place-items-center rounded-full border border-line text-lg leading-none disabled:opacity-30 sm:size-10"
            >
              ‹
            </button>
            <button
              aria-label="Next month"
              disabled={!canNext}
              onClick={() => goMonth(1)}
              className="grid size-9 place-items-center rounded-full border border-line text-lg leading-none disabled:opacity-30 sm:size-10"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 pb-1.5 text-center text-xs font-medium uppercase tracking-wider text-muted">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        <div
          style={{ "--rows": weekRows.length } as React.CSSProperties}
          className="grid auto-rows-[3.9rem] grid-cols-7 gap-1 sm:gap-1.5 lg:[grid-auto-rows:min(7rem,calc((100dvh-15rem)/var(--rows)))]"
        >
          {weeks.map((c) => {
            const day = fromISO(c.iso).getDate();
            if (!c.inCourse) {
              return (
                <div key={c.iso} className={`rounded-xl p-1.5 text-xs ${c.inMonth ? "text-muted/50" : "text-transparent"}`}>
                  {c.inMonth ? day : ""}
                </div>
              );
            }
            const status = ready ? statusOf(c.n) : "future";
            const isToday = c.iso === today;
            const item = schedule[c.n - 1];
            const bg =
              status === "done" ? "bg-good-soft" : status === "missed" ? "bg-bad-soft" : status === "partial" ? "bg-half-soft" : "bg-paper/60";
            return (
              <Link
                key={c.iso}
                href={`/day/${c.n}`}
                title={`Day ${c.n} · ${item.title}`}
                className={`group relative flex min-h-0 flex-col rounded-xl p-1 transition hover:brightness-95 active:brightness-90 sm:p-1.5 ${bg} ${
                  isToday ? "ring-2 ring-accent" : ""
                } ${c.inMonth ? "" : "opacity-40"}`}
              >
                <span className="flex items-start justify-between text-xs">
                  <span className={`font-semibold ${isToday ? "text-accent" : "text-ink/80"}`}>{day}</span>
                  <span className="hidden rounded px-1 text-[10px] font-medium text-white sm:inline" style={{ background: PHASE_COLOR[item.phase] }}>
                    {c.n}
                  </span>
                </span>
                <span className="grid min-h-0 flex-1 place-items-center">
                  <StatusMark status={status} className="pop max-h-full w-[78%] max-w-[54px] sm:w-[62%]" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
          <Legend status="done" label="Completed" />
          <Legend status="partial" label="Started" />
          <Legend status="missed" label="Missed" />
          <span className="ml-auto hidden items-center gap-3 sm:flex">
            {(["a1", "a2", "b1", "exam"] as const).map((p) => (
              <span key={p} className="flex items-center gap-1">
                <i className="size-2 rounded-sm" style={{ background: PHASE_COLOR[p] }} />
                {p === "exam" ? "Exam prep" : p.toUpperCase()}
              </span>
            ))}
          </span>
        </div>
      </section>

      <div className="order-1 lg:col-start-2 lg:row-start-1">
        <div className="rounded-3xl border border-line bg-card p-5">
          {todayItem ? (
            <>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
                <span>Today · Day {todayItem.n} of {total}</span>
                <span className="rounded px-1.5 py-0.5 text-white" style={{ background: PHASE_COLOR[todayItem.phase] }}>
                  {todayItem.phase === "exam" ? "Exam" : todayItem.phase.toUpperCase()}
                </span>
              </div>
              <h2 className="serif mt-2 text-xl font-semibold leading-snug">{todayItem.title}</h2>
              <p className="mt-1 text-sm text-muted">{todayItem.unitLabel}</p>
              <Link
                href={`/day/${todayItem.n}`}
                className={`mt-4 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-medium ${
                  todayStatus === "done" ? "bg-good-soft text-good" : "bg-accent text-white hover:opacity-90"
                }`}
              >
                {todayStatus === "done" ? `Completed · ${todayBest}%` : todayStatus === "partial" ? "Continue today’s lesson" : "Start today’s lesson"}
              </Link>
            </>
          ) : (
            todayN < 1 && today ? (
              <>
                <p className="eyebrow">Coming up</p>
                <h2 className="serif mt-3 text-xl leading-snug">
                  Your course starts <em>{niceDate(start)}</em>
                </h2>
                <p className="mt-1 text-sm text-muted">Day 1 · {schedule[0].title}</p>
                <Link href="/day/1" className="mt-4 flex items-center justify-center rounded-full bg-accent px-4 py-3 text-base font-medium text-white hover:opacity-90">
                  Preview Day 1
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted">{todayN > total ? "Course finished. Well done." : "Loading…"}</p>
            )
          )}
        </div>

      </div>

      <aside className="order-3 flex min-h-0 flex-col gap-4 lg:col-start-2 lg:row-start-2">
        <div className="rounded-3xl border border-line bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-medium">Progress</h3>
            <span className="text-sm text-muted">
              {doneCount} / {total} days{avg !== null ? ` · avg ${avg}%` : ""}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-good transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
          </div>
          <Link href="/progress" className="mt-3 inline-block text-sm text-accent hover:underline">
            See full progress →
          </Link>
        </div>

        <div className="flex min-h-[160px] flex-1 flex-col rounded-3xl border border-line bg-card p-5 lg:min-h-0">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-medium">To catch up</h3>
            <span className={`text-sm ${catchUp.length ? "font-medium text-bad" : "text-muted"}`}>{catchUp.length}</span>
          </div>
          {catchUp.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing missed. Keep the streak going.</p>
          ) : (
            <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {catchUp.map((s) => {
                const st = statusOf(s.n);
                const d = fromISO(dateOf(s.n));
                return (
                  <li key={s.n}>
                    <Link href={`/day/${s.n}`} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-paper">
                      <StatusMark status={st} className="size-6 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{s.title}</span>
                        <span className="block text-xs text-muted">
                          Day {s.n} · {WEEKDAYS[(d.getDay() + 6) % 7]} {d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </main>
  );
}

function Legend({ status, label }: { status: "done" | "partial" | "missed"; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <StatusMark status={status} className="size-4" />
      {label}
    </span>
  );
}

