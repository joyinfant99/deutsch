"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "deutsch-install-hint-dismissed";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

type Mode = "ios" | "prompt" | "none";

function useInstall() {
  const [mode, setMode] = useState<Mode>("none");
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const nav = navigator as Navigator & { standalone?: boolean };
      const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      let gone = false;
      try {
        gone = localStorage.getItem(KEY) === "1";
      } catch {}
      setDismissed(gone || standalone);
      if (ios && !standalone) setMode("ios");
    }, 0);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setMode("prompt");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };
  const install = async () => {
    if (!event) return;
    await event.prompt();
    setEvent(null);
    setMode("none");
  };
  return { mode, dismissed, dismiss, install };
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline size-[1.1em] -translate-y-px align-middle" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 00-1-1h-1" />
    </svg>
  );
}

/** Short tip for the login screen. */
export function InstallInline() {
  const { mode, dismissed } = useInstall();
  if (dismissed || mode !== "ios") return null;
  return (
    <p className="mx-auto mt-6 max-w-xs rounded-2xl bg-sand px-4 py-3 text-xs leading-relaxed text-muted">
      <strong className="text-ink">On iPhone:</strong> tap <ShareIcon /> Share, then <strong className="text-ink">Add to Home Screen</strong> to use it like an app.
    </p>
  );
}

/** Dismissible banner above the tab bar on phones. */
export default function InstallHint() {
  const path = usePathname();
  const { mode, dismissed, dismiss, install } = useInstall();
  if (dismissed || mode === "none" || /\/exam$/.test(path)) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom)+0.5rem)] z-30 flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-lg lg:hidden">
      <span className="serif grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-xl italic text-paper">D</span>
      <div className="min-w-0 flex-1 text-sm leading-snug">
        <p className="font-medium">Install Deutsch</p>
        {mode === "ios" ? (
          <p className="mt-0.5 text-xs text-muted">
            Tap <ShareIcon /> Share, then <strong className="text-ink">Add to Home Screen</strong> for full-screen, app-like study.
          </p>
        ) : (
          <button onClick={install} className="mt-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white">
            Add to home screen
          </button>
        )}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-paper">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
