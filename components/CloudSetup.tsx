"use client";

import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";

export default function CloudSetup() {
  const { retry, loadError } = useProgress();
  const { signOut, user } = useAuth();
  const missingDb = /does not exist|database \(default\) does not|404/i.test(loadError);
  const denied = /403|permission|PERMISSION/i.test(loadError);

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-card p-6 sm:p-8">
        <p className="eyebrow">One-time setup</p>
        <h1 className="serif mt-3 text-3xl">
          Your online storage isn’t <em>ready</em> yet
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Your progress and chats are saved in your online account, not on this device, so they follow you between laptop, phone and tablet.
          {missingDb
            ? " The Firebase database hasn’t been created yet."
            : denied
              ? " The database refused the request, so its security rules probably need updating."
              : " Couldn’t reach the database just now."}
        </p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>
            Open the <strong>Firebase console</strong> → your project → <strong>Firestore Database</strong> → <strong>Create database</strong> (pick “production mode”).
          </li>
          <li>
            Open the <strong>Rules</strong> tab and publish the rules from the README (each user may only read and write their own record).
          </li>
          <li>Come back here and press “Try again”.</li>
        </ol>
        {loadError && <p className="mt-4 break-words rounded-xl bg-sand px-3 py-2 text-xs text-muted">Details: {loadError}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button onClick={retry} className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
            Try again
          </button>
          <button onClick={() => signOut()} className="rounded-full border border-line px-4 py-2.5 text-sm hover:bg-paper">
            Sign out{user?.email ? ` (${user.email})` : ""}
          </button>
        </div>
      </div>
    </main>
  );
}
