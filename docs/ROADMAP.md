# Roadmap

## iPhone notifications (planned, not built)

Goal: a simple push notification on the iPhone that opens the app, e.g. "Day 12 today, you are 2 days behind".

**Chosen approach: ntfy** (free iOS app, no account).
- Install ntfy from the App Store and subscribe to a private, hard-to-guess topic name.
- A scheduled job (Vercel Cron hitting a new route such as `app/api/notify/route.ts`) reads progress from Firestore and POSTs to `https://ntfy.sh/<topic>` with a `Click` header set to https://deutsch.joyinfant.com.
- Planned nudges: morning (today's day + days behind) and evening (if today is not done).

**Alternatives:** Pushover (about $5 one-time, more polished); iPhone Shortcuts daily Automation (fixed reminder, no server, cannot see progress).

**Open decisions:** morning/evening times; how the server reads a user's progress (Firestore access from a cron job without a signed-in user); where to store the ntfy topic (env var `NTFY_TOPIC`).
