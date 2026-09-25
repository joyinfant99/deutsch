import { getDay, getSchedule, phaseLabel } from "@/lib/course";
import { statusFor } from "@/lib/status";
import { addDays } from "@/lib/dates";
import type { Progress } from "@/lib/types";
import { firebaseConfig } from "@/lib/firebase";
import type { TutorMode, TutorMsg, TutorRequest } from "@/lib/tutorTypes";

export const maxDuration = 60;

const verified = new Map<string, { uid: string; email: string; exp: number }>();

async function verifyGoogleUser(req: Request): Promise<{ uid: string; email: string } | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const cached = verified.get(token);
  if (cached && cached.exp > Date.now()) return cached;
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!r.ok) return null;
    const u = (await r.json()).users?.[0];
    if (!u?.localId) return null;
    const viaGoogle = (u.providerUserInfo ?? []).some((p: { providerId?: string }) => p.providerId === "google.com");
    if (!viaGoogle || !u.email) return null;
    const allowed = (process.env.TUTOR_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(String(u.email).toLowerCase())) return null;
    const out = { uid: String(u.localId), email: String(u.email), exp: Date.now() + 5 * 60_000 };
    verified.set(token, out);
    if (verified.size > 200) verified.clear();
    return out;
  } catch {
    return null;
  }
}

const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);
const fail = (status: number, error: string) => Response.json({ error }, { status });

function buildContext(day: number, mode: TutorMode, today: string, progress: Progress): string {
  const schedule = getSchedule();
  const total = schedule.length;
  const st = (n: number) => statusFor(progress, today, n);
  const date = (n: number) => addDays(progress.startDate, n - 1);
  const title = (n: number) => `${schedule[n - 1].title} (${phaseLabel(schedule[n - 1].phase)})`;

  let done = 0;
  const marks: number[] = [];
  const missed: number[] = [];
  const unfinished: number[] = [];
  for (let n = 1; n <= total; n++) {
    const s = st(n);
    if (s === "done") {
      done++;
      marks.push(progress.days[n]?.best ?? 0);
    } else if (s === "missed") missed.push(n);
    else if (s === "partial" && date(n) < today) unfinished.push(n);
  }
  const avg = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;

  let streak = 0;
  for (let n = Math.min(total, Math.max(0, Math.round((new Date(today + "T12:00:00").getTime() - new Date(progress.startDate + "T12:00:00").getTime()) / 86400000) + 1)); n >= 1; n--) {
    if (st(n) === "done") streak++;
    else if (date(n) === today) continue;
    else break;
  }

  const attempts = Object.entries(progress.days)
    .flatMap(([n, d]) => (d.attempts ?? []).map((a) => ({ n: Number(n), a })))
    .filter((x) => x.n >= 1 && x.n <= total)
    .sort((x, y) => y.a.at.localeCompare(x.a.at));
  const recent = attempts.slice(0, 6).map((x) => `Day ${x.n} ${schedule[x.n - 1].title}: ${x.a.score}/${x.a.total} on ${x.a.at.slice(0, 10)}`);
  const seen = new Set<string>();
  const mistakes: string[] = [];
  for (const x of attempts.slice(0, 10)) {
    for (const m of x.a.missed ?? []) {
      if (seen.has(m.q) || mistakes.length >= 12) continue;
      seen.add(m.q);
      mistakes.push(`Day ${x.n}: “${clip(m.q, 110)}” – student answered “${clip(m.yours, 60)}”, correct answer “${clip(m.right, 60)}”`);
    }
  }

  const d = getDay(day)!;
  const lines: string[] = [];
  lines.push(`Today's date: ${today}. Course start: ${progress.startDate}. The student is looking at day ${day} of ${total} (${date(day)}), ${phaseLabel(d.phase)}: ${d.title}. Unit: ${d.unitLabel}. Day status: ${st(day)}.`);
  lines.push("");
  lines.push("STUDENT HISTORY");
  lines.push(`- Days completed: ${done}/${total}${avg !== null ? `, average mark ${avg}%` : ""}; current streak: ${streak} day(s).`);
  lines.push(`- Missed days (not done, date passed): ${missed.length ? missed.slice(0, 10).map((n) => `Day ${n} ${schedule[n - 1].title}`).join("; ") : "none"}.`);
  lines.push(`- Started but unfinished: ${unfinished.length ? unfinished.slice(0, 8).map((n) => `Day ${n}`).join(", ") : "none"}.`);
  lines.push(`- Recent exams: ${recent.length ? recent.join(" | ") : "none yet"}.`);
  lines.push(`- Recent mistakes (already seen by the student): ${mistakes.length ? "\n  " + mistakes.join("\n  ") : "none recorded yet"}.`);
  const own = progress.days[day];
  if (own?.attempts?.length) lines.push(`- Attempts on this day: ${own.attempts.map((a) => `${a.score}/${a.total}`).join(", ")}.`);

  lines.push("");
  lines.push("TODAY'S CONTENT (what the student studies on this page)");
  for (const l of d.lessons) {
    lines.push(`Lesson: ${l.lesson.title} — topic: ${l.lesson.topic}; grammar focus: ${l.lesson.grammar || "none"}.`);
    if (l.notes) {
      lines.push(`Goal: ${l.notes.goal}`);
      if (l.notes.grammar) lines.push(`Grammar note “${l.notes.grammar.title}”: ${clip(l.notes.grammar.text.replace(/\*\*/g, ""), 1100)}`);
      lines.push(`Key words: ${l.notes.words.slice(0, 14).map(([g, e]) => `${g} = ${e}`).join("; ")}`);
    }
  }
  if (d.special) {
    lines.push(`Goal: ${d.special.goal}`);
    for (const nb of d.special.notes.slice(0, 4)) lines.push(`${nb.heading}: ${clip(nb.text.replace(/\*\*/g, ""), 600)}`);
    lines.push(`Materials: ${d.special.materials.map((m) => m.title).join("; ")}`);
  }
  if (d.extra) lines.push(`Extra video: ${d.extra.title} — focus: ${d.extra.focus}`);

  lines.push("");
  lines.push("EARLIER DAYS");
  for (let n = Math.max(1, day - 3); n < day; n++) lines.push(`Day ${n}: ${title(n)} — ${schedule[n - 1].subtitle}`);
  lines.push("");
  lines.push("COMING UP");
  for (let n = day + 1; n <= Math.min(total, day + 5); n++) lines.push(`Day ${n} (${date(n)}): ${title(n)} — ${schedule[n - 1].subtitle}`);
  if (day + 5 < total) lines.push(`… and ${total - day - 5} more days, ending with the final mock exam on ${date(total)}.`);

  lines.push("");
  lines.push(
    mode === "exam"
      ? "MODE: the student is on the exam page. You cannot see the exam questions. Do NOT reveal or confirm answers to exam questions; encourage them to attempt first, and offer general explanations or help reviewing mistakes after they finish."
      : mode === "overview"
        ? "MODE: the student is on the calendar/progress overview. Greet briefly and tell them concretely what to do next (today's day, missed days to catch up), and answer questions about the course plan."
        : "MODE: the student is studying today's material. Help them understand it, quiz them lightly if they ask, and connect it to earlier mistakes and coming days.",
  );
  return lines.join("\n");
}

const SYSTEM = `You are the student's personal German teacher inside a daily workbook app. The student is an English speaker learning German from A1 to B1, preparing for the Goethe-Zertifikat B1 exam around April/May 2027.

How to teach:
- Be warm, patient and concrete. Keep answers short (under 130 words) unless asked for more.
- Explain in simple English and give German examples that fit the student's current level (mostly simple German at A1/A2; more German at B1). Add a short English gloss for German sentences.
- Use the context below: refer to what they studied recently, their mistakes and what is coming next, so you guide them like a teacher who knows their history.
- Correct the student's German gently: show the corrected sentence and one-line reason.
- Formatting: plain text with **bold** and short "- " bullet lists only. No headings, no tables, no code blocks.
- When quizzing: ask exactly ONE question per message, never include or hint at the answer in the same message (no answer bullets, no examples that contain it), then wait for the student's reply. After they answer, say if it is right, correct gently, then ask the next one.
- End most replies with one small follow-up question or mini-task.
- Never invent facts about the course. If something is not in the context, say so. Stay on learning German; politely redirect other topics.`;

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return fail(503, "The tutor is not set up yet: add GROQ_API_KEY to your environment (see README).");

  let body: TutorRequest;
  try {
    body = (await req.json()) as TutorRequest;
  } catch {
    return fail(400, "Bad request.");
  }

  const who = await verifyGoogleUser(req);
  if (!who) return fail(401, "Please sign in with Google to use the teacher.");

  if (limited(who.uid)) return fail(429, "Slow down a little – too many messages in a minute.");

  const total = getSchedule().length;
  const day = Number(body.day);
  if (!Number.isInteger(day) || day < 1 || day > total) return fail(400, "Bad day.");
  const mode: TutorMode = body.mode === "exam" || body.mode === "overview" ? body.mode : "study";
  if (!body.progress || typeof body.progress.startDate !== "string" || typeof body.progress.days !== "object") return fail(400, "Bad progress.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.today) || !/^\d{4}-\d{2}-\d{2}$/.test(body.progress.startDate)) return fail(400, "Bad date.");

  const messages: TutorMsg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: clip(m.content, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return fail(400, "No question.");

  const context = buildContext(day, mode, body.today, body.progress);

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  let upstream: Response;
  try {
    upstream = await fetch(`${process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.5,
        max_tokens: 1500,
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
        messages: [{ role: "system", content: `${SYSTEM}\n\n=== CONTEXT ===\n${context}` }, ...messages],
      }),
    });
  } catch {
    return fail(502, "Could not reach the AI service.");
  }
  if (!upstream.ok || !upstream.body) {
    if (upstream.status === 429) return fail(429, "The free AI quota is used up for now – try again in a bit.");
    if (upstream.status === 401) return fail(502, "The AI key was rejected. Check GROQ_API_KEY.");
    return fail(502, `The AI service returned an error (${upstream.status}).`);
  }

  const reader = upstream.body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return controller.close();
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        let sent = false;
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(enc.encode(delta));
              sent = true;
            }
          } catch {}
        }
        if (sent) return;
      }
    },
    cancel() {
      reader.cancel();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
