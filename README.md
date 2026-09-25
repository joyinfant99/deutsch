# Deutsch – Daily Workbook

A simple daily German course (A1 → B1, then 25 exam-prep days). Start date: Monday 28 Sep 2026, 218 days.

- Calendar = one page; ✓ done (exam ≥ 70%), half-circle started, ✗ missed. Click a day for that day's study material, then take its exam.
- **Your teacher** (chat button on every page): an AI tutor that knows today's lesson, your exam history and mistakes, and what is coming up. Powered by Groq's free tier (open open GPT-OSS model).
- **Google sign-in is required.** Your progress and teacher chats are stored only in your online account (Firebase Auth + Firestore), never on the device, so they follow you between laptop, phone and tablet.
- The AI teacher is only available to signed-in users.
- *Progress → Download backup* saves an optional copy as a file.

## Run locally

```bash
npm install
cp .env.example .env.local   # then paste your free Groq key
npm run dev -- -p 3100       # http://localhost:3100
```

Without `GROQ_API_KEY` everything works except the teacher chat.

## Deploy on Vercel

1. Push this folder to GitHub and import it in Vercel.
2. In *Project → Settings → Environment Variables* add `GROQ_API_KEY` (and optionally `TUTOR_ALLOWED_EMAILS`, `GROQ_MODEL`).
3. In the Firebase console: enable **Authentication → Google**, add your Vercel domain under **Authentication → Settings → Authorized domains**, create a **Firestore** database and publish the rules below.
4. Deploy.

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

## Content

Content lives in `content/src/`; rebuild the merged files with `node scripts/build-content.mjs --strict`.
