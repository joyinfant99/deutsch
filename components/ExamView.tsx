"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MissedQuestion, Phase, Question } from "@/lib/types";
import { PASS_MARK } from "@/lib/types";
import { useProgress } from "@/lib/progress";

const SRC_LABEL: Record<string, string> = {
  video: "From the video",
  vocab: "Vocabulary",
  grammar: "Grammar",
  extra: "From the extra material",
  review: "Review",
  reading: "Reading",
};

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[.,;:!?„“"'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Prepared {
  q: Question;
  order: number[];
}

function mark(pct: number) {
  if (pct >= 90) return "Sehr gut";
  if (pct >= 80) return "Gut";
  if (pct >= 70) return "Bestanden";
  return "Noch nicht bestanden";
}

export default function ExamView({ n, title, phase, quiz, total }: { n: number; title: string; phase: Phase; quiz: Question[]; total: number }) {
  const { recordAttempt } = useProgress();
  const [items, setItems] = useState<Prepared[] | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const recorded = useRef(false);

  const start = () => {
    const prepared = quiz.map((q) => ({ q, order: q.t === "mc" ? shuffle(q.o.map((_, k) => k)) : [] }));
    setItems(prepared);
    setAnswers(prepared.map(() => null));
    setI(0);
    setDraft("");
    setDone(false);
    recorded.current = false;
  };
  useEffect(() => {
    const t = setTimeout(start, 0);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    if (!items) return [];
    return items.map(({ q }, k) => {
      const a = answers[k];
      if (a === null || a === undefined) return false;
      if (q.t === "mc") return a === q.a;
      return q.a.some((x) => normalise(x) === normalise(String(a)));
    });
  }, [items, answers]);
  const score = results.filter(Boolean).length;

  useEffect(() => {
    if (done && items && !recorded.current) {
      recorded.current = true;
      const missed: MissedQuestion[] = [];
      items.forEach(({ q }, k) => {
        if (results[k]) return;
        const a = answers[k];
        const yours = a === null || a === undefined || a === "" ? "(no answer)" : q.t === "mc" ? q.o[a as number] : String(a);
        missed.push({ q: q.q, yours, right: q.t === "mc" ? q.o[q.a] : q.a[0], src: q.src });
      });
      recordAttempt(n, score, quiz.length, missed.slice(0, 15));
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items) return <main className="mx-auto max-w-2xl px-5 py-10 text-muted">Preparing your exam…</main>;

  const cur = items[i];
  const q = cur.q;
  const answered = answers[i] !== null && answers[i] !== undefined && answers[i] !== "";

  const next = () => {
    if (i + 1 >= items.length) setDone(true);
    else {
      setI(i + 1);
      setDraft(String(answers[i + 1] ?? ""));
    }
  };
  const setAnswer = (v: number | string) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    const ok = score / items.length >= PASS_MARK;
    return (
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
        <div className={`pop rounded-3xl border p-8 text-center ${ok ? "border-good/30 bg-good-soft" : "border-bad/30 bg-bad-soft"}`}>
          <p className="text-xs uppercase tracking-wider text-muted">{title}</p>
          <p className={`serif mt-3 text-7xl font-semibold ${ok ? "text-good" : "text-bad"}`}>{pct}%</p>
          <p className="mt-2 text-lg font-medium">
            {score} of {items.length} correct · {mark(pct)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {ok ? "Day complete. Your tick is on the calendar." : `You need ${Math.round(PASS_MARK * 100)}% to complete the day. Review the mistakes below, then retake.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!ok && (
              <button onClick={start} className="rounded-2xl bg-accent px-6 py-3 font-medium text-white hover:opacity-90">
                Retake exam
              </button>
            )}
            <Link href={`/day/${n}`} className="rounded-2xl border border-line bg-card px-6 py-3 font-medium hover:bg-paper">
              Back to today’s page
            </Link>
            {ok && n < total && (
              <Link href={`/day/${n + 1}`} className="rounded-2xl border border-line bg-card px-6 py-3 font-medium hover:bg-paper">
                Preview Day {n + 1} ›
              </Link>
            )}
            <Link href="/" className="rounded-2xl bg-ink px-6 py-3 font-medium text-paper hover:opacity-90">
              Calendar
            </Link>
          </div>
        </div>

        <h2 className="serif mt-10 text-2xl font-semibold">Review</h2>
        <ol className="mt-4 space-y-3">
          {items.map(({ q }, k) => {
            const a = answers[k];
            const yours = q.t === "mc" ? (a === null ? "—" : q.o[a as number]) : String(a || "—");
            const right = q.t === "mc" ? q.o[q.a] : q.a[0];
            return (
              <li key={k} className={`rounded-2xl border p-4 ${results[k] ? "border-good/30 bg-good-soft/40" : "border-bad/30 bg-bad-soft/50"}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${results[k] ? "bg-good" : "bg-bad"}`}>
                    {results[k] ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1 text-[15px]">
                    <p className="font-medium">{q.q}</p>
                    {!results[k] && (
                      <p className="mt-1 text-muted">
                        You answered: <span className="text-bad">{yours}</span>
                      </p>
                    )}
                    <p className="mt-0.5 text-muted">
                      Correct answer: <span className="font-medium text-good">{right}</span>
                    </p>
                    {q.why && <p className="mt-1.5 text-sm text-muted">{q.why}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href={`/day/${n}`} className="hover:text-ink">
          ← Leave exam
        </Link>
        <span>
          {title} · {phase === "exam" ? "Exam prep" : phase.toUpperCase()}
        </span>
      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs uppercase tracking-wider text-muted">
        Question {i + 1} of {items.length}
        {q.src ? ` · ${SRC_LABEL[q.src]}` : ""}
      </p>

      <h1 className="serif mt-5 text-2xl font-semibold leading-snug sm:text-3xl">{q.q}</h1>

      {q.t === "mc" ? (
        <div className="mt-6 space-y-2.5">
          {cur.order.map((idx) => (
            <button
              key={idx}
              onClick={() => setAnswer(idx)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[16px] transition active:scale-[0.99] ${
                answers[i] === idx ? "border-accent bg-accent-soft" : "border-line bg-card hover:border-ink/40"
              }`}
            >
              <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${answers[i] === idx ? "border-accent" : "border-line"}`}>
                {answers[i] === idx && <span className="size-2.5 rounded-full bg-accent" />}
              </span>
              {q.o[idx]}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <input
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setAnswer(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && answered) next();
            }}
            placeholder="Type your answer"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-lg outline-none focus:border-accent"
          />
          <p className="mt-2 text-xs text-muted">Umlauts optional: ae = ä, oe = ö, ue = ü, ss = ß.</p>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-card/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <button
          onClick={() => {
            if (i > 0) {
              setI(i - 1);
              setDraft(String(answers[i - 1] ?? ""));
            }
          }}
          disabled={i === 0}
          className="min-h-12 rounded-2xl px-4 py-3 text-muted hover:text-ink disabled:opacity-30"
        >
          ‹ Back
        </button>
        <button
          onClick={next}
          disabled={!answered}
          className="min-h-12 flex-1 rounded-2xl bg-accent px-7 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-40 lg:flex-none"
        >
          {i + 1 === items.length ? "Finish exam" : "Next ›"}
        </button>
      </div>
    </main>
  );
}
