"use client";

import Link from "next/link";
import type { ScheduleItem } from "@/lib/course";
import { useProgress } from "@/lib/progress";
import type { Progress } from "@/lib/types";
import { useState } from "react";
import { fromISO, MONTHS } from "@/lib/dates";

const PHASES: { key: string; label: string; color: string; blurb: string }[] = [
  { key: "a1", label: "A1 · Reactivation", color: "var(--a1)", blurb: "Two Nicos Weg lessons a day" },
  { key: "a2", label: "A2 · Building", color: "var(--a2)", blurb: "One lesson a day" },
  { key: "b1", label: "B1 · Independence", color: "var(--b1)", blurb: "One lesson a day" },
  { key: "exam", label: "Exam preparation", color: "var(--exam)", blurb: "Lesen, Hören, Schreiben, Sprechen" },
];

export default function ProgressView({ schedule }: { schedule: ScheduleItem[] }) {
  const { ready, progress, statusOf, dateOf, replaceAll } = useProgress();
  const [msg, setMsg] = useState("");

  const all = schedule.map((s) => ({ ...s, status: ready ? statusOf(s.n) : "future" }));
  const doneAll = all.filter((s) => s.status === "done").length;
  const scored = all.filter((s) => progress.days[s.n]?.completedAt);
  const avg = scored.length ? Math.round(scored.reduce((a, s) => a + progress.days[s.n].best, 0) / scored.length) : null;
  const recent = all
    .filter((s) => (progress.days[s.n]?.attempts.length ?? 0) > 0)
    .flatMap((s) => progress.days[s.n].attempts.map((a) => ({ ...s, a })))
    .sort((x, y) => y.a.at.localeCompare(x.a.at))
    .slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      <p className="eyebrow">Your journey</p>
      <h1 className="serif mt-3 text-4xl sm:text-5xl">
        Your <em>progress</em>
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Days completed" value={`${doneAll} / ${schedule.length}`} />
        <Stat label="Average mark" value={avg === null ? "—" : `${avg}%`} />
        <Stat label="Course ends" value={ready ? fmt(dateOf(schedule.length)) : "—"} />
      </div>

      <div className="mt-8 space-y-5">
        {PHASES.map((ph) => {
          const days = all.filter((s) => s.phase === ph.key);
          const done = days.filter((s) => s.status === "done").length;
          const marks = days.filter((s) => progress.days[s.n]?.completedAt).map((s) => progress.days[s.n].best);
          const pAvg = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;
          return (
            <section key={ph.key} className="rounded-3xl border border-line bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="serif text-xl font-semibold" style={{ color: ph.color }}>
                    {ph.label}
                  </h2>
                  <p className="text-sm text-muted">{ph.blurb}</p>
                </div>
                <p className="text-sm text-muted">
                  {done} / {days.length} days{pAvg !== null ? ` · avg ${pAvg}%` : ""}
                </p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper">
                <div className="h-full rounded-full transition-all" style={{ width: `${(done / days.length) * 100}%`, background: ph.color }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {days.map((s) => (
                  <Link
                    key={s.n}
                    href={`/day/${s.n}`}
                    title={`Day ${s.n} · ${s.title}${progress.days[s.n]?.best ? ` · ${progress.days[s.n].best}%` : ""}`}
                    className={`size-4 rounded-[4px] border ${
                      s.status === "done"
                        ? "border-good bg-good"
                        : s.status === "partial"
                          ? "border-half bg-half"
                          : s.status === "missed"
                            ? "border-bad bg-bad-soft"
                            : "border-line bg-paper"
                    }`}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-8 rounded-3xl border border-line bg-card p-5 sm:p-6">
        <h2 className="serif text-xl font-semibold">Recent exams</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No exams taken yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {recent.map((r, k) => {
              const pct = Math.round((r.a.score / r.a.total) * 100);
              return (
                <li key={k} className="flex items-center gap-4 py-2.5 text-sm">
                  <span className={`w-12 text-right font-semibold ${pct >= 70 ? "text-good" : "text-bad"}`}>{pct}%</span>
                  <Link href={`/day/${r.n}`} className="min-w-0 flex-1 truncate hover:underline">
                    Day {r.n} · {r.title}
                  </Link>
                  <span className="text-muted">{new Date(r.a.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-5 rounded-3xl border border-line bg-card p-5 sm:p-6">
        <h2 className="serif text-xl">Back up your progress</h2>
        <p className="mt-1 text-sm text-muted">
          Your progress is saved in this browser. Download a backup now and then, and restore it on another device or after clearing browser data.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "deutsch-progress.json";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Download backup
          </button>
          <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm hover:bg-paper">
            Restore from file
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                try {
                  const p = JSON.parse(await f.text()) as Progress;
                  if (typeof p.startDate !== "string" || typeof p.days !== "object") throw new Error("bad");
                  replaceAll(p);
                  setMsg("Progress restored.");
                } catch {
                  setMsg("That file is not a valid backup.");
                }
              }}
            />
          </label>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </section>
    </main>
  );
}

function fmt(iso: string) {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="serif mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
