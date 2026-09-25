"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";

export interface PhaseInfo {
  key: string;
  label: string;
  sub: string;
  color: string;
  first: number;
  last: number;
}

function Icon({ name }: { name: "calendar" | "today" | "chart" }) {
  const p = {
    calendar: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
    today: "M5 12l5 5L20 7",
    chart: "M5 20V10M12 20V4M19 20v-7",
  }[name];
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={p} />
    </svg>
  );
}

function Panel({ phases, total, onNavigate }: { phases: PhaseInfo[]; total: number; onNavigate?: () => void }) {
  const path = usePathname();
  const { ready, statusOf, today, dayNumberOf, progress, sync, flush } = useProgress();
  const { user, loading, error, signIn, signOut } = useAuth();
  const todayN = today ? dayNumberOf(today) : 0;
  const todayLink = todayN >= 1 && todayN <= total ? todayN : 1;
  const currentDay = /^\/day\/(\d+)/.exec(path)?.[1];
  const cur = currentDay ? Number(currentDay) : null;

  const doneOf = (a: number, b: number) => {
    let c = 0;
    for (let n = a; n <= b; n++) if (ready && statusOf(n) === "done") c++;
    return c;
  };
  const doneAll = doneOf(1, total);
  let missed = 0;
  if (ready) for (let n = 1; n <= total; n++) if (statusOf(n) === "missed") missed++;

  const nav = (href: string, label: string, icon: "calendar" | "today" | "chart", active: boolean, badge?: number) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "bg-accent text-white" : "text-ink/75 hover:bg-paper hover:text-ink"
      }`}
    >
      <Icon name={icon} />
      <span className="flex-1">{label}</span>
      {badge ? <span className="rounded-full bg-bad px-1.5 text-[11px] font-semibold leading-5 text-white">{badge}</span> : null}
    </Link>
  );

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-5">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-2">
        <span className="serif grid size-9 place-items-center rounded-full bg-accent text-lg italic text-paper">D</span>
        <span className="leading-tight">
          <span className="serif block text-xl">Deutsch</span>
          <span className="block text-[11px] uppercase tracking-[0.16em] text-muted">daily workbook</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav("/", "Calendar", "calendar", path === "/", missed)}
        {nav(`/day/${todayLink}`, "Today’s lesson", "today", cur !== null && cur === todayLink)}
        {nav("/progress", "Progress", "chart", path === "/progress")}
      </nav>

      <div>
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Course</p>
        <ul className="flex flex-col gap-1">
          {phases.map((ph) => {
            const n = ph.last - ph.first + 1;
            const d = doneOf(ph.first, ph.last);
            const active = cur !== null && cur >= ph.first && cur <= ph.last;
            let target = ph.first;
            if (ready) {
              for (let k = ph.first; k <= ph.last; k++) {
                if (statusOf(k) !== "done") { target = k; break; }
                target = ph.last;
              }
            }
            return (
              <li key={ph.key}>
                <Link
                  href={`/day/${target}`}
                  onClick={onNavigate}
                  className={`block rounded-xl px-3 py-2 transition-colors ${active ? "bg-paper" : "hover:bg-paper"}`}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <i className="size-2.5 rounded-sm" style={{ background: ph.color }} />
                    <span className="flex-1">{ph.label}</span>
                    <span className="text-xs font-normal text-muted">
                      {d}/{n}
                    </span>
                  </span>
                  <span className="mt-0.5 block pl-[18px] text-xs text-muted">{ph.sub} · days {ph.first}–{ph.last}</span>
                  <span className="mt-1.5 ml-[18px] block h-1.5 overflow-hidden rounded-full bg-line/70">
                    <span className="block h-full rounded-full transition-all" style={{ width: `${(d / n) * 100}%`, background: ph.color }} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto rounded-2xl border border-line bg-paper/60 p-3 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-medium">Overall</span>
          <span className="text-muted">{doneAll} / {total} days</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/70">
          <div className="h-full rounded-full bg-good transition-all" style={{ width: `${(doneAll / total) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">Started {progress.startDate}</p>
      </div>

      <div className="rounded-2xl border border-line bg-paper/60 p-3 text-sm">
        {loading ? (
          <p className="text-xs text-muted">Checking sign-in…</p>
        ) : user ? (
          <>
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-accent text-xs text-paper">{(user.email ?? "?")[0].toUpperCase()}</span>
              )}
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{user.displayName ?? "Signed in"}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <i
                className={`size-1.5 shrink-0 rounded-full ${sync === "synced" ? "bg-good" : sync === "syncing" ? "bg-half" : "bg-bad"}`}
              />
              {sync === "synced" ? "Saved to your account" : sync === "syncing" ? "Saving…" : "Couldn’t save – retrying"}
            </p>
            <button
              className="mt-2.5 w-full whitespace-nowrap rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
              onClick={async () => {
                await flush();
                await signOut();
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted">Sign in to sync your progress across devices and unlock your teacher.</p>
            <button
              onClick={signIn}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-sm font-medium hover:bg-paper"
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
                <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" />
                <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4l3.8-3z" />
                <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z" />
              </svg>
              Sign in with Google
            </button>
            {error && <p className="mt-2 text-xs text-bad">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function TabIcon({ name }: { name: "calendar" | "today" | "chart" | "chat" }) {
  const p = {
    calendar: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
    today: "M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5zM8 12.5l2.7 2.7L16 9.5",
    chart: "M5 20V10M12 20V4M19 20v-7",
    chat: "M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z",
  }[name];
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={p} />
    </svg>
  );
}

function MobileNav({ total }: { total: number }) {
  const path = usePathname();
  const { today, dayNumberOf, statusOf } = useProgress();
  const todayN = today ? dayNumberOf(today) : 0;
  const todayLink = todayN >= 1 && todayN <= total ? todayN : 1;
  let missed = 0;
  for (let n = 1; n <= total; n++) if (statusOf(n) === "missed") missed++;
  if (/\/exam$/.test(path)) return null;
  const cur = /^\/day\/(\d+)/.exec(path)?.[1];
  const tab = (href: string, label: string, icon: "calendar" | "today" | "chart", active: boolean, badge?: number) => (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}
    >
      <span className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${active ? "bg-accent-soft" : ""}`}>
        <TabIcon name={icon} />
      </span>
      {label}
      {badge ? <span className="absolute right-[calc(50%-1.6rem)] top-1 rounded-full bg-bad px-1.5 text-[10px] leading-4 text-white">{badge}</span> : null}
    </Link>
  );
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {tab("/", "Calendar", "calendar", path === "/", missed)}
      {tab(`/day/${todayLink}`, "Today", "today", cur !== undefined && Number(cur) === todayLink)}
      {tab("/progress", "Progress", "chart", path === "/progress")}
      <button
        onClick={() => window.dispatchEvent(new Event("open-tutor"))}
        className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted"
      >
        <span className="grid h-7 w-14 place-items-center rounded-full">
          <TabIcon name="chat" />
        </span>
        Teacher
      </button>
    </nav>
  );
}

export default function Sidebar({ phases, total }: { phases: PhaseInfo[]; total: number }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(t);
  }, [path]);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-line bg-card lg:block">
        <Panel phases={phases} total={total} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/95 px-4 pb-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="serif grid size-8 place-items-center rounded-full bg-accent text-base italic text-paper">D</span>
          <span className="serif text-xl">Deutsch</span>
        </Link>
        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-xl border border-line"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      <MobileNav total={total} />

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[19rem] max-w-[85vw] bg-card shadow-xl">
            <Panel phases={phases} total={total} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
