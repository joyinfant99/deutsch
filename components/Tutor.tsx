"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import type { Progress } from "@/lib/types";
import type { TutorMode, TutorMsg, TutorRequest } from "@/lib/tutorTypes";
import RichText from "./RichText";


function compact(p: Progress): Progress {
  const days: Progress["days"] = {};
  for (const [k, d] of Object.entries(p.days)) {
    const attempts = d.attempts.slice(-4).map((a, i, arr) => (i === arr.length - 1 ? a : { score: a.score, total: a.total, at: a.at }));
    days[k] = { checked: d.checked, best: d.best, completedAt: d.completedAt, attempts };
  }
  return { startDate: p.startDate, days };
}

const CHIPS: Record<TutorMode, string[]> = {
  study: ["Explain today's grammar simply", "Quiz me on today's words", "What should I focus on?", "What's coming up next?"],
  exam: ["Any tips before I start?", "How should I handle fill-in questions?"],
  overview: ["What should I do today?", "How am I doing so far?", "What are my weak spots?"],
};

export default function Tutor({ titles }: { titles: string[] }) {
  const path = usePathname();
  const { ready, progress, today, dayNumberOf, chats, setChat } = useProgress();
  const { user, signIn, getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<TutorMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);

  const m = /^\/day\/(\d+)(\/exam)?/.exec(path);
  const total = titles.length;
  const todayN = today ? Math.min(total, Math.max(1, dayNumberOf(today))) : 1;
  const day = m ? Math.min(total, Math.max(1, Number(m[1]))) : todayN;
  const mode: TutorMode = m ? (m[2] ? "exam" : "study") : "overview";

  const busyRef = useRef(false);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!busyRef.current) setMsgs(chats[String(day)] ?? []);
    }, 0);
    return () => clearTimeout(t);
  }, [day, chats]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [msgs, open, busy]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy || !ready || !user) return;
      const last = msgs[msgs.length - 1];
      const base = last?.role === "user" && last.content === question ? msgs.slice(0, -1) : msgs;
      const history: TutorMsg[] = [...base, { role: "user", content: question }];
      setMsgs([...history, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);
      setError("");
      const ctl = new AbortController();
      abort.current = ctl;
      let answer = "";
      try {
        const body: TutorRequest = {
          day,
          mode,
          today,
          progress: compact(progress),
          messages: history,
        };
        const token = await getToken();
        const res = await fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: ctl.signal });
        if (!res.ok || !res.body) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Something went wrong.");
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += dec.decode(value, { stream: true });
          setMsgs([...history, { role: "assistant", content: answer }]);
        }
        setChat(day, [...history, { role: "assistant", content: answer }]);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
        setMsgs(answer ? [...history, { role: "assistant", content: answer }] : history);
      } finally {
        setBusy(false);
      }
    },
    [busy, ready, user, getToken, msgs, day, mode, today, progress, setChat],
  );

  const clear = () => {
    abort.current?.abort();
    setMsgs([]);
    setChat(day, []);
    setError("");
  };

  if (!ready) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg hover:opacity-90"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
          </svg>
          Ask your teacher
        </button>
      )}

      {open && (
        <section
          aria-label="Your teacher"
          className="fixed bottom-4 right-4 z-50 flex h-[min(640px,calc(100dvh-2rem))] w-[min(410px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="serif grid size-9 shrink-0 place-items-center rounded-full bg-accent text-lg italic text-paper">T</span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="serif text-lg">Your teacher</p>
              <p className="truncate text-xs text-muted">
                {mode === "overview" ? "Overview" : `Day ${day}`} · {titles[day - 1]}
              </p>
            </div>
            {msgs.length > 0 && (
              <button onClick={clear} className="rounded-full px-2.5 py-1 text-xs text-muted hover:bg-paper hover:text-ink">
                Clear
              </button>
            )}
            <button aria-label="Close" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-full hover:bg-paper">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.length === 0 && (
              <div className="text-sm text-muted">
                <p>
                  I know what you studied, how your exams went and what is coming up. Ask me anything about German
                  {mode === "exam" ? " – I won't give away answers to the exam questions." : "."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CHIPS[mode].map((c) => (
                    <button key={c} onClick={() => send(c)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink hover:bg-paper">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((x, i) =>
              x.role === "user" ? (
                <div key={i} className="ml-8 rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm text-white">
                  {x.content}
                </div>
              ) : (
                <div key={i} className="mr-6 rounded-2xl rounded-bl-md bg-sand px-3.5 py-2.5">
                  {x.content ? <RichText text={x.content} /> : <span className="text-sm text-muted">Thinking…</span>}
                </div>
              ),
            )}
            {error && <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
            <div ref={bottom} />
          </div>

          {user ? (
          <form
              className="flex items-end gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about today's lesson…"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
            ) : (
            <div className="border-t border-line p-4 text-center">
              <p className="text-sm text-muted">Sign in with Google to talk to your teacher.</p>
              <button onClick={signIn} className="mt-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                Sign in with Google
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
