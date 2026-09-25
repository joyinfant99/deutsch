"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DayProgress, MissedQuestion, Progress } from "./types";
import { statusFor, type Status } from "./status";
import { PASS_MARK } from "./types";
import { addDays, todayISO } from "./dates";
import { readCloud, writeCloud } from "./cloud";
import { useAuth } from "./auth";
import { mergeProgress } from "./mergeProgress";
import type { TutorMsg } from "./tutorTypes";
import CloudSetup from "@/components/CloudSetup";

export type { Status } from "./status";

export type Chats = Record<string, TutorMsg[]>;

interface Ctx {
  ready: boolean;
  progress: Progress;
  chats: Chats;
  today: string;
  dateOf: (n: number) => string;
  dayNumberOf: (iso: string) => number;
  statusOf: (n: number) => Status;
  toggleChecked: (n: number, key: string) => void;
  recordAttempt: (n: number, score: number, total: number, missed?: MissedQuestion[]) => boolean;
  replaceAll: (p: Progress) => void;
  setChat: (day: number, msgs: TutorMsg[]) => void;
  sync: "syncing" | "synced" | "error";
  retry: () => void;
  flush: () => Promise<void>;
  loadError: string;
}

const EMPTY: Progress = { startDate: "2026-09-28", days: {} };
const ProgressCtx = createContext<Ctx | null>(null);

function parseProgress(json: string | null): Progress | null {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as Progress;
    return p && typeof p.startDate === "string" && typeof p.days === "object" ? p : null;
  } catch {
    return null;
  }
}
function parseChats(json: string | null): Chats | null {
  if (!json) return null;
  try {
    const c = JSON.parse(json) as Chats;
    return c && typeof c === "object" ? c : null;
  } catch {
    return null;
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, getToken } = useAuth();
  const uid = user?.uid ?? null;

  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [chats, setChats] = useState<Chats>({});
  const [today, setToday] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [sync, setSync] = useState<"syncing" | "synced" | "error">("syncing");

  const latest = useRef<Progress>(EMPTY);
  const latestChats = useRef<Chats>({});
  const dirtyP = useRef(false);
  const dirtyC = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<string | null>(null);
  const uidRef = useRef<string | null>(null);
  const loaded = useRef(false);

  const flushRef = useRef<() => Promise<void>>(async () => {});

  const flush = useCallback(async () => {
    const id = uidRef.current;
    if (!id || !loaded.current || (!dirtyP.current && !dirtyC.current)) return;
    if (timer.current) clearTimeout(timer.current);
    const fields: { progressJson?: string; chatsJson?: string } = {};
    const sentP = dirtyP.current ? JSON.stringify(latest.current) : null;
    const sentC = dirtyC.current ? JSON.stringify(latestChats.current) : null;
    if (sentP) fields.progressJson = sentP;
    if (sentC) fields.chatsJson = sentC;
    try {
      setSync("syncing");
      const token = await getToken();
      if (!token) throw new Error("no token");
      tokenRef.current = token;
      await writeCloud(token, id, fields);
      if (sentP && JSON.stringify(latest.current) === sentP) dirtyP.current = false;
      if (sentC && JSON.stringify(latestChats.current) === sentC) dirtyC.current = false;
      setSync(dirtyP.current || dirtyC.current ? "syncing" : "synced");
    } catch {
      setSync("error");
      timer.current = setTimeout(() => flushRef.current(), 8000);
    }
  }, [getToken]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), 500);
    setSync("syncing");
  }, []);

  const load = useCallback(
    async (initial: boolean) => {
      const id = uidRef.current;
      if (!id) return;
      try {
        const token = await getToken();
        if (!token) throw new Error("no token");
        tokenRef.current = token;
        const doc = await readCloud(token, id);
        const cloudP = parseProgress(doc.progressJson);
        const cloudC = parseChats(doc.chatsJson);
        if (cloudP) {
          const next = dirtyP.current ? mergeProgress(latest.current, cloudP) : cloudP;
          latest.current = next;
          setProgress(next);
        }
        if (cloudC && !dirtyC.current) {
          latestChats.current = cloudC;
          setChats(cloudC);
        }
        if (!doc.progressJson && initial) {
          // First run: write once so problems with rules/permissions show up right away.
          await writeCloud(token, id, { progressJson: JSON.stringify(latest.current) });
        }
        loaded.current = true;
        setLoadState("ready");
        setLoadError("");
        setSync(dirtyP.current || dirtyC.current ? "syncing" : "synced");
        if (dirtyP.current || dirtyC.current) flushRef.current();
      } catch (e) {
        if (initial || !loaded.current) {
          setLoadState("error");
          setLoadError((e as Error).message || "Could not reach your account storage.");
        } else setSync("error");
      }
    },
    [getToken],
  );

  const start = useCallback(() => {
    setLoadState("loading");
    load(true);
  }, [load]);

  useEffect(() => {
    uidRef.current = uid;
    if (!uid) return;
    const t = setTimeout(() => {
      setToday(todayISO());
      start();
    }, 0);
    const refresh = () => {
      if (document.visibilityState === "visible" && loaded.current && !dirtyP.current && !dirtyC.current) load(false);
      if (document.visibilityState === "hidden" && loaded.current && (dirtyP.current || dirtyC.current) && tokenRef.current) {
        const fields: { progressJson?: string; chatsJson?: string } = {};
        if (dirtyP.current) fields.progressJson = JSON.stringify(latest.current);
        if (dirtyC.current) fields.chatsJson = JSON.stringify(latestChats.current);
        writeCloud(tokenRef.current, uid, fields, true).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [uid, start, load]);

  const persist = useCallback(
    (next: Progress) => {
      latest.current = next;
      setProgress(next);
      dirtyP.current = true;
      schedule();
    },
    [schedule],
  );

  const setChat = useCallback(
    (day: number, msgs: TutorMsg[]) => {
      latestChats.current = { ...latestChats.current, [String(day)]: msgs.slice(-24) };
      setChats(latestChats.current);
      dirtyC.current = true;
      schedule();
    },
    [schedule],
  );

  const update = useCallback(
    (n: number, fn: (d: DayProgress) => DayProgress) => {
      const cur = latest.current;
      const d = cur.days[n] ?? { checked: [], attempts: [], best: 0 };
      persist({ ...cur, days: { ...cur.days, [n]: fn(d) } });
    },
    [persist],
  );

  const value = useMemo<Ctx>(() => {
    const ready = loadState === "ready";
    const dateOf = (n: number) => addDays(progress.startDate, n - 1);
    const dayNumberOf = (iso: string) => {
      const a = new Date(progress.startDate + "T12:00:00").getTime();
      const b = new Date(iso + "T12:00:00").getTime();
      return Math.round((b - a) / 86400000) + 1;
    };
    return {
      ready,
      progress,
      chats,
      today,
      dateOf,
      dayNumberOf,
      statusOf: (n) => (ready ? statusFor(progress, today, n) : "future"),
      toggleChecked: (n, key) =>
        update(n, (d) => ({
          ...d,
          checked: d.checked.includes(key) ? d.checked.filter((k) => k !== key) : [...d.checked, key],
        })),
      replaceAll: (p) => persist(p),
      setChat,
      sync,
      retry: start,
      flush,
      loadError,
      recordAttempt: (n, score, total, missed) => {
        const passed = total > 0 && score / total >= PASS_MARK;
        update(n, (d) => ({
          ...d,
          attempts: [...d.attempts, { score, total, at: new Date().toISOString(), ...(missed?.length ? { missed } : {}) }],
          best: Math.max(d.best, total ? Math.round((score / total) * 100) : 0),
          completedAt: d.completedAt ?? (passed ? new Date().toISOString() : undefined),
        }));
        return passed;
      },
    };
  }, [progress, chats, loadState, today, update, persist, setChat, sync, start, flush, loadError]);

  return (
    <ProgressCtx.Provider value={value}>
      {loadState === "ready" ? (
        children
      ) : loadState === "error" ? (
        <CloudSetup />
      ) : (
        <main className="grid min-h-dvh place-items-center">
          <span className="serif grid size-12 animate-pulse place-items-center rounded-full bg-accent text-2xl italic text-paper">D</span>
        </main>
      )}
    </ProgressCtx.Provider>
  );
}

export function useProgress(): Ctx {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress outside provider");
  return c;
}
