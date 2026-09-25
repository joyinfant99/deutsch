# Deutsch – Daily Workbook

A daily German course that takes an English speaker from **A1 to B1** and prepares them for the **Goethe-Zertifikat B1** exam. One page per day: read, watch, then take a short exam and get a mark. A calendar shows what is done, half-done or missed, and an AI teacher (chat) knows your history and what is coming up.

- **Live:** https://deutsch.joyinfant.com
- **Repo:** https://github.com/joyinfant99/deutsch (every push to `main` auto-deploys on Vercel)
- **Course:** 218 days, **Monday 28 Sep 2026 → Monday 3 May 2027**

---

## What it does

| Feature | Details |
| --- | --- |
| **Calendar dashboard** | Month grid. ✓ = passed (exam ≥ 70 %), half-circle = started, ✗ = missed. Side panel: today's card, overall progress, "To catch up" list. |
| **Day page** | Everything for the day: lesson notes (vocabulary, grammar, phrases), links to the free DW *Nicos Weg* video and script, one extra video, checkable study steps. |
| **Exam** | Multiple-choice and fill-in questions, shuffled. 70 % completes the day; unlimited retakes. Review screen shows the right answer and a short explanation. |
| **Progress page** | Per-level bars, average mark, recent exams, optional JSON backup/restore. |
| **AI teacher** | Chat on every page (bottom tab on phones). Knows today's lesson, your marks, your recent mistakes, missed days and the next 5 days. Never sees exam answers. |
| **Accounts** | Google sign-in only. Progress and chats live in your online account (nothing stored on the device), so laptop, phone and tablet stay in sync. |
| **Phone-first** | Bottom tab bar, full-screen chat, thumb-reach exam buttons, installable to the home screen. |

## Course structure (218 days)

| Days | Phase | Content |
| --- | --- | --- |
| 1–38 | A1 | 76 *Nicos Weg* lessons, **2 per day** |
| 39 | A1 | A1 level test |
| 40–115 | A2 | 76 lessons, 1 per day |
| 116 | A2 | A2 level test |
| 117–192 | B1 | 76 lessons, 1 per day |
| 193 | B1 | B1 level test |
| 194–218 | Exam prep | 25 days on the Goethe B1 format: Lesen ×5, Hören ×5, Schreiben ×4, Sprechen ×4, grammar & vocabulary review, two full mocks, final mock + exam-day checklist |

Backbone: the free **DW *Nicos Weg*** course (228 lessons, real URLs and scripts). Every lesson has a goal, 8–12 words, a grammar note or phrases, and ~7–8 quiz questions (video / vocabulary / grammar). Each lesson day also has one **extra** YouTube video with 3 questions. Review questions are mixed in on the second A1 day of a unit and on every 4th A2/B1 lesson.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- **Firebase Auth** (Google provider) via the JS SDK
- **Cloud Firestore** via its **REST API** (no live-connection SDK, so no retry noise)
- **Groq API** (OpenAI-compatible, streaming) with `openai/gpt-oss-120b`
- Hosting: **Vercel** · DNS: **Cloudflare** · Fonts: Playfair Display + Inter · Theme modelled on opensourcenanny.com (cream `#faf6ef`, teal `#1d4b47`, terracotta `#c1703f`)

There is no separate backend server: the only server code is the Next.js route `app/api/tutor/route.ts` (a Vercel serverless function). Course content is static JSON bundled with the app.

## Project structure

```
app/
  layout.tsx            Providers, viewport/PWA metadata, shell (sidebar + tutor + install hint)
  page.tsx              Calendar dashboard
  day/[day]/page.tsx    Day page          day/[day]/exam/page.tsx   Exam
  progress/page.tsx     Progress page
  api/tutor/route.ts    AI teacher endpoint (auth-checked, streams from Groq)
  icon.tsx, apple-icon.tsx, maskable-icon/, favicon.ico, manifest.ts   Icons + web manifest
components/
  AuthGate.tsx          Login screen; nothing else renders until signed in
  Sidebar.tsx           Desktop sidebar, mobile header/drawer, bottom tab bar, account card
  Dashboard.tsx  DayView.tsx  ExamView.tsx  ProgressView.tsx  StatusMark.tsx  RichText.tsx
  Tutor.tsx             Chat panel (auto-growing input, keyboard-aware on phones)
  CloudSetup.tsx        Shown if Firestore isn't reachable / not set up
  InstallHint.tsx       "Add to Home Screen" hint (iPhone) / install button (Android)
lib/
  course.ts             Builds the 218-day plan from content JSON (server-only)
  progress.tsx          Progress + chat state, cloud load/save/merge
  cloud.ts              Firestore REST read/write
  auth.tsx firebase.ts  Google sign-in, Firebase config
  status.ts mergeProgress.ts dates.ts types.ts tutorTypes.ts iconArt.tsx
content/
  nicos.json            228 lessons (ids like a1-05): titles, DW URLs, script PDF URLs
  src/                  Authored source (see "Editing content")
  lessons.json extras.json special.json     GENERATED – do not edit by hand
scripts/
  build-content.mjs     Validates and merges content/src → content/*.json
  gen_b1_*.py           Generators for B1 extras, B1 test and the exam-prep days
```

## How progress is stored

Each user has **one Firestore document**: `deutsch_users/{uid}`

| Field | Meaning |
| --- | --- |
| `progressJson` | `{ startDate, days: { "<n>": { checked[], attempts[{score,total,at,missed[]}], best, completedAt } } }` |
| `chatsJson` | Teacher chat threads, one per day (last 24 messages each) |
| `updatedAt` | Timestamp |

- **Status of a day** is computed, not stored: `done` (has `completedAt`), `future` (date not reached), `partial` (something ticked or attempted), `today`, `missed`. Day *n* always sits on `startDate + n − 1`; the schedule never shifts if you fall behind.
- **Saving:** changes are debounced (~0.5 s). Tab hide sends a last `keepalive` write. Failed writes retry every 8 s.
- **Loading:** on sign-in, and whenever the tab regains focus (if there are no unsaved changes), the app reads the document. If both sides changed, `mergeProgress` unions ticks and attempts and keeps the best mark/earliest completion.
- **Rules** (only you can touch your own record):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /deutsch_users/{uid} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
  ```

## The AI teacher

`POST /api/tutor` with a Firebase ID token in `Authorization: Bearer …`.

1. The server verifies the token with Google (`identitytoolkit accounts:lookup`) and requires a **Google-provider** account. `TUTOR_ALLOWED_EMAILS` can restrict it further. Limit: 20 messages/min per user.
2. It builds a context block from the course files and the client-sent progress: date, day/phase, your marks and streak, missed days, recent exams, recent mistakes (already seen by you), today's lesson (goal, grammar note, key words, extra video), the previous 3 and next 5 days.
3. **Quiz answers are never included**, and in exam mode the model is told not to reveal or confirm answers.
4. It streams the reply from Groq (`reasoning_effort: low` for gpt-oss models).

The model has **no internet access** — it only knows what the app sends plus its training.

---

## Setup

### Run locally
```bash
npm install
cp .env.example .env.local     # add GROQ_API_KEY
npm run dev -- -p 3100         # http://localhost:3100
```
Checks: `npx tsc --noEmit` · `npm run lint` · `npx next build`

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | for the teacher | Free key from console.groq.com/keys |
| `GROQ_MODEL` | no | Default `openai/gpt-oss-120b` (Groq retires models – check `GET /openai/v1/models`) |
| `TUTOR_ALLOWED_EMAILS` | recommended | Comma-separated Google accounts allowed to use the teacher |
| `GROQ_BASE_URL` | no | Override the API base (used for local mock testing) |
| `NEXT_PUBLIC_FIREBASE_*` | no | Override the built-in Firebase web config (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, …) |

The Firebase **web config is public by design** (it is in the client bundle); security comes from Auth and the Firestore rules above.

### Firebase (project `presalesbench`)
1. **Authentication → Sign-in method → Google**: enabled.
2. **Authentication → Settings → Authorized domains**: must include every domain the app runs on – `localhost`, `vercel.app`, and **`deutsch.joyinfant.com`** (add it or Google sign-in shows "domain not authorised").
3. **Firestore Database**: create `(default)` in production mode and publish the rules above.

### Vercel + domain
- Vercel project **`deutsch`** (team `joys-projects-e34293cf`), connected to `joyinfant99/deutsch`. Set `GROQ_API_KEY` (and `TUTOR_ALLOWED_EMAILS`) under *Settings → Environment Variables*.
- DNS lives in **Cloudflare**: `CNAME deutsch → aad16e0cd6e54175.vercel-dns-017.com`, **DNS only** (grey cloud). If Vercel shows a different recommended target, use that.
- `vercel deploy --prod` works too, but pushing to `main` is enough.

## Editing content

Source files are in `content/src/`; the app reads only the generated `content/*.json`.

| File pattern | What it holds |
| --- | --- |
| `lessons-<level>-NN.json` | Lesson notes keyed by lesson id (`a1-05`, `b1-31`) |
| `extras-*.json` | The extra video per day, keyed by day number (`"117"`) |
| `tests-a1/a2/b1.json` | Level tests (days 39, 116, 193) |
| `exam-b1.json` | The 25 exam-prep days (array, in order) |

```bash
node scripts/build-content.mjs --strict   # validate + regenerate content/*.json
```
The validator checks question shape (answer index, duplicate options, `___` blanks), ≥6 words and ≥5 questions per lesson, ≥2 questions per extra, and https URLs. `--strict` also fails if any of the 228 lessons is missing. After content changes, run it and commit the regenerated JSON.

Lesson shape:
```json
"b1-05": { "goal": "…", "words": [["die Neuigkeit, -en", "piece of news"]],
  "grammar": { "title": "…", "text": "…**bold**…\n\n- bullet", "ex": [["de", "en"]] },
  "quiz": [ { "t": "mc", "q": "…", "o": ["a","b","c"], "a": 0, "why": "…", "src": "video" },
            { "t": "fill", "q": "… ___ …", "a": ["answer"], "why": "…", "src": "grammar" } ] }
```
Fill answers are compared case-insensitively with ä/ö/ü/ß ↔ ae/oe/ue/ss and punctuation ignored, so list alternatives in `a` when more than one is valid. Options are shuffled at display time, so the correct one may always be listed first.

## Phone / iPhone

- Installable: iPhone → Safari → **Share → Add to Home Screen**; Android → browser menu → **Install app**. Icons: `app/icon.tsx` (favicon/tab), `apple-icon.tsx` (180 px), `maskable-icon/` (Android), `favicon.ico`.
- Layout uses safe-area insets, 16 px inputs (no iOS zoom), and the teacher chat follows the on-screen keyboard via `visualViewport`.
- **Known risk:** Google sign-in uses a popup. In an iPhone *home-screen* app popups can fail. If so, the fix is to serve Firebase's auth handler from this domain (proxy `/__/auth/*`, set `authDomain` to the app domain, and add the redirect URI in Google Cloud → OAuth client).

## Limitations and notes

- **Extras are concept-based:** for A1 day 19 onward the extra-video questions test the topic and language, not the exact words in the video (YouTube blocked transcript downloads while authoring).
- **Login gate is client-side.** Lesson text ships in the app bundle, so someone technical could read it without signing in. Progress, chats and the AI endpoint *are* protected server-side.
- **Exam format:** prep follows the Goethe-Zertifikat B1 (Lesen 65 min, Hören 40, Schreiben 60, Sprechen 15; pass 60 % per module). Check your own exam provider (Goethe / telc / DTZ).
- Goethe HTML practice pages block command-line requests but open in a browser; the official PDFs link directly.
- The Arbeitsbuch PDF supplied earlier is a *teacher* activity book, so it was not used as learner material.
- Progress is per Google account; there is no offline mode.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Your online storage isn't ready yet" | Create the Firestore `(default)` database and publish the rules; press *Try again*. |
| "domain is not authorised" on sign-in | Add the domain in Firebase → Authentication → Settings → Authorized domains. |
| Teacher says "not set up" | `GROQ_API_KEY` missing in the environment (redeploy after adding). |
| Teacher: "AI service returned an error (404)" | The model was retired – set `GROQ_MODEL` to one from Groq's models list. |
| Teacher: "quota used up" | Groq free-tier limit; retry later. |
| Custom domain not loading after DNS change | Wait 1–2 min for the certificate; check the CNAME is *DNS only*. |

## History

Built in one long session: content research and authoring (A1 → B1 + exam prep), calendar/exam/progress UI, mobile polish, Google sign-in with Firestore sync, and the Groq teacher. An earlier, heavier prototype (`german-journey`, with its own backend) was replaced by this app and removed; the original product notes remain in `../GERMAN_B1_APP_SPEC.md`.
