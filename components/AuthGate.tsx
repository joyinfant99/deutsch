"use client";

import { useAuth } from "@/lib/auth";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" />
      <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" />
      <path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4l3.8-3z" />
      <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3C6.5 7.4 9 5.4 12 5.4z" />
    </svg>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signIn } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <span className="serif grid size-12 animate-pulse place-items-center rounded-full bg-accent text-2xl italic text-paper">D</span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-10">
        <div className="w-full max-w-md text-center">
          <span className="serif mx-auto grid size-14 place-items-center rounded-full bg-accent text-3xl italic text-paper">D</span>
          <p className="eyebrow mt-8">Daily German workbook</p>
          <h1 className="serif mt-4 text-4xl leading-tight sm:text-5xl">
            German from A1 to B1, <em>one day at a time</em>.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
            Sign in to open your calendar, lessons and exams. Your progress follows you across devices, and your teacher remembers where you are.
          </p>
          <button
            onClick={signIn}
            className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-full bg-accent px-6 py-3.5 text-base font-medium text-white shadow-sm hover:opacity-90"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white">
              <GoogleMark />
            </span>
            Continue with Google
          </button>
          {error && <p className="mx-auto mt-4 max-w-sm rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
          <p className="mt-6 text-xs text-muted">Google sign-in only. We only use your account to save your progress.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
