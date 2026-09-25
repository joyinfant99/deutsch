"use client";

import Link from "next/link";
import type { DayContent, DayLesson, Extra, NoteBlock } from "@/lib/types";
import { PASS_MARK } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { niceDate } from "@/lib/dates";
import RichText, { German } from "./RichText";
import StatusMark from "./StatusMark";

const PHASE_COLOR: Record<string, string> = { a1: "var(--a1)", a2: "var(--a2)", b1: "var(--b1)", exam: "var(--exam)" };
const KIND_LABEL: Record<string, string> = { video: "Video", audio: "Audio", article: "Reading", pdf: "PDF", exercise: "Exercises", lesson: "Video + exercises" };

interface Material {
  key: string;
  kind: string;
  title: string;
  source: string;
  url: string;
  minutes: number;
  focus: string;
}

export default function DayView({ day, total }: { day: DayContent; total: number }) {
  const { progress, dateOf, statusOf, toggleChecked, ready } = useProgress();
  const dp = progress.days[day.n];
  const checked = new Set(dp?.checked ?? []);
  const status = ready ? statusOf(day.n) : "future";
  const minutesPer = day.phase === "a1" ? 12 : day.phase === "a2" ? 15 : 20;

  const materials: Material[] = [];
  day.lessons.forEach(({ lesson }) => {
    materials.push({
      key: `watch:${lesson.id}`,
      kind: "lesson",
      title: `Nicos Weg · ${lesson.title}`,
      source: "Deutsche Welle",
      url: lesson.url,
      minutes: minutesPer,
      focus: "Watch the video, then work through the Exercises tab. Open the Grammar tab if the notes above are not enough.",
    });
    if (lesson.script) {
      materials.push({
        key: `script:${lesson.id}`,
        kind: "pdf",
        title: `Script and vocabulary · ${lesson.title}`,
        source: "Deutsche Welle",
        url: lesson.script,
        minutes: 3,
        focus: "Read the dialogue while listening once more. Underline the words from today’s vocabulary list.",
      });
    }
  });
  if (day.extra) materials.push({ key: "extra", ...day.extra });
  (day.special?.materials ?? []).forEach((m: Extra, i) => materials.push({ key: `mat:${i}`, ...m }));

  const stepsTotal = 1 + materials.length;
  const stepsDone = (checked.has("read") ? 1 : 0) + materials.filter((m) => checked.has(m.key)).length;
  const attempts = dp?.attempts ?? [];
  const passPct = Math.round(PASS_MARK * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      <div className="flex items-center justify-between text-sm">
        <Link href="/" className="text-muted hover:text-ink">
          ← Calendar
        </Link>
        <div className="flex items-center gap-4">
          {day.n > 1 && (
            <Link href={`/day/${day.n - 1}`} className="text-muted hover:text-ink">
              ‹ Day {day.n - 1}
            </Link>
          )}
          {day.n < total && (
            <Link href={`/day/${day.n + 1}`} className="text-muted hover:text-ink">
              Day {day.n + 1} ›
            </Link>
          )}
        </div>
      </div>

      <header className="mt-6 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted">
            <span className="rounded px-1.5 py-0.5 font-medium text-white" style={{ background: PHASE_COLOR[day.phase] }}>
              {day.phase === "exam" ? "Exam prep" : day.phase.toUpperCase()}
            </span>
            <span>
              Day {day.n} of {total}
            </span>
            {ready && <span>· {niceDate(dateOf(day.n))}</span>}
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{day.title}</h1>
          <p className="mt-2 text-muted">
            {day.unitLabel} · about {day.minutes} min
          </p>
        </div>
        <StatusMark status={status} className="size-14 shrink-0" />
      </header>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(stepsDone / stepsTotal) * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {stepsDone} of {stepsTotal} study steps ticked
      </p>

      <Section n={1} title="Read" hint="Your workbook pages for today" done={checked.has("read")} onToggle={() => toggleChecked(day.n, "read")}>
        {day.special ? (
          <>
            <p className="serif text-lg leading-snug">{day.special.goal}</p>
            <div className="mt-5 space-y-6">
              {day.special.notes.map((b, i) => (
                <NoteCard key={i} block={b} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-10">
            {day.lessons.map((l) => (
              <LessonNotesView key={l.lesson.id} l={l} multi={day.lessons.length > 1} />
            ))}
          </div>
        )}
      </Section>

      <Section n={2} title="Watch, listen, do" hint="Tick each one when finished">
        <div className="space-y-3">
          {materials.map((m) => (
            <MaterialCard key={m.key} m={m} done={checked.has(m.key)} onToggle={() => toggleChecked(day.n, m.key)} />
          ))}
        </div>
      </Section>

      <Section n={3} title="Exam" hint={`${day.quiz.length} questions · pass at ${passPct}%`}>
        {day.quiz.length === 0 ? (
          <p className="text-sm text-muted">No exam has been written for this day yet.</p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              {attempts.length === 0 ? (
                "You have not taken this exam yet. Finish the study steps first."
              ) : (
                <>
                  Best mark <strong className="text-ink">{dp?.best}%</strong> · {attempts.length} attempt{attempts.length > 1 ? "s" : ""}
                  {dp?.completedAt ? " · day completed" : ` · below ${passPct}%, try again`}
                </>
              )}
            </div>
            <Link
              href={`/day/${day.n}/exam`}
              className="rounded-2xl bg-accent px-6 py-3 text-center font-medium text-white hover:opacity-90"
            >
              {attempts.length ? "Retake exam" : "Take today’s exam"}
            </Link>
          </div>
        )}
      </Section>
    </main>
  );
}

function Section({
  n,
  title,
  hint,
  done,
  onToggle,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  done?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-semibold text-paper">{n}</span>
        <div className="flex-1">
          <h2 className="serif text-2xl font-semibold leading-none">{title}</h2>
          <p className="mt-1 text-sm text-muted">{hint}</p>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className={`min-h-10 rounded-full border px-4 py-1.5 text-sm transition ${
              done ? "border-good bg-good-soft text-good" : "border-line text-muted hover:text-ink"
            }`}
          >
            {done ? "✓ Read" : "Mark as read"}
          </button>
        )}
      </div>
      <div className="rounded-3xl border border-line bg-card p-5 sm:p-6">{children}</div>
    </section>
  );
}

function NoteCard({ block }: { block: NoteBlock }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">{block.heading}</h3>
      <RichText text={block.text} className="mt-2" />
      {block.table && <PairTable rows={block.table} />}
    </div>
  );
}

function PairTable({ rows, head }: { rows: [string, string][]; head?: [string, string] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-left text-[15px]">
        {head && (
          <thead className="bg-paper text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">{head[0]}</th>
              <th className="px-4 py-2 font-medium">{head[1]}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map(([de, en], i) => (
            <tr key={i} className="border-t border-line first:border-t-0">
              <td className="w-1/2 px-4 py-2 align-top font-medium">
                <German text={de} />
              </td>
              <td className="px-4 py-2 align-top text-muted">{en}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LessonNotesView({ l, multi }: { l: DayLesson; multi: boolean }) {
  const { lesson, notes } = l;
  return (
    <article>
      {multi && (
        <h3 className="serif mb-3 text-xl font-semibold">
          {lesson.title} <span className="text-base font-normal text-muted">· {lesson.topic}</span>
        </h3>
      )}
      {notes ? (
        <div className="space-y-6">
          <p className="serif text-lg leading-snug">{notes.goal}</p>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Wortschatz · Vocabulary</h4>
            <PairTable rows={notes.words} />
            <p className="mt-2 text-xs text-muted">
              Article colours: <span style={{ color: "#2563a8" }}>der</span> · <span style={{ color: "#b83232" }}>die</span> ·{" "}
              <span style={{ color: "#2f7d4f" }}>das</span>. Say each word aloud.
            </p>
          </div>
          {notes.grammar && (
            <div className="rounded-2xl bg-accent-soft p-4 sm:p-5">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Grammatik · {notes.grammar.title}</h4>
              <RichText text={notes.grammar.text} className="mt-2" />
              {notes.grammar.ex && <PairTable rows={notes.grammar.ex} />}
            </div>
          )}
          {notes.phrases && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Redemittel · Useful phrases</h4>
              <PairTable rows={notes.phrases} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">Notes for this lesson are still being written. Use the Deutsche Welle lesson below.</p>
      )}
    </article>
  );
}

function MaterialCard({ m, done, onToggle }: { m: Material; done: boolean; onToggle: () => void }) {
  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-4 transition ${done ? "border-good/40 bg-good-soft/50" : "border-line bg-paper/40"}`}>
      <button
        onClick={onToggle}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border-2 transition ${
          done ? "border-good bg-good text-white" : "border-line bg-card hover:border-ink"
        }`}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-10" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded bg-ink px-1.5 py-0.5 font-medium uppercase tracking-wider text-paper">{KIND_LABEL[m.kind] ?? m.kind}</span>
          <span>{m.source}</span>
          <span>· {m.minutes} min</span>
        </div>
        <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 block font-medium leading-snug text-accent hover:underline">
          {m.title} ↗
        </a>
        <p className="mt-1 text-sm text-muted">{m.focus}</p>
      </div>
    </div>
  );
}
