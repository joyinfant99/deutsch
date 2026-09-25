import "server-only";
import nicos from "@/content/nicos.json";
import lessonNotes from "@/content/lessons.json";
import extras from "@/content/extras.json";
import special from "@/content/special.json";
import type {
  DayContent,
  DayLesson,
  DayPlan,
  Extra,
  LessonNotes,
  NicosLesson,
  Phase,
  Question,
  SpecialDay,
} from "./types";

const LESSONS = nicos as NicosLesson[];
const NOTES = lessonNotes as unknown as Record<string, LessonNotes>;
const EXTRAS = extras as unknown as Record<string, Extra>;
const SPECIAL = special as unknown as { tests: Record<string, SpecialDay>; exam: SpecialDay[] };

const byLevel = (lv: string) => LESSONS.filter((l) => l.level === lv);

const PHASE_LABEL: Record<Phase, string> = { a1: "A1", a2: "A2", b1: "B1", exam: "Exam prep" };
export const phaseLabel = (p: Phase) => PHASE_LABEL[p];

function unitLabel(l: NicosLesson): string {
  const lv = l.level.toUpperCase();
  return l.unit === 0 ? `${lv} · ${l.unitName}` : `${lv} · Unit ${l.unit} · ${l.unitName}`;
}

let cache: DayPlan[] | null = null;

export function getPlan(): DayPlan[] {
  if (cache) return cache;
  const plan: DayPlan[] = [];
  let n = 0;

  const a1 = byLevel("a1");
  for (let i = 0; i < a1.length; i += 2) {
    const pair = [a1[i], a1[i + 1]];
    plan.push({
      n: ++n,
      phase: "a1",
      unitLabel: unitLabel(pair[0]),
      title: pair.map((l) => l.title).join("  ·  "),
      subtitle: pair.map((l) => l.topic).join(" · "),
      kind: "lessons",
      lessonIds: pair.map((l) => l.id),
    });
  }
  plan.push({ n: ++n, phase: "a1", unitLabel: "A1 · Level test", title: "A1 Level Test", subtitle: "Prove you have A1 locked in", kind: "level-test", lessonIds: [] });

  for (const lv of ["a2", "b1"] as const) {
    for (const l of byLevel(lv)) {
      plan.push({
        n: ++n,
        phase: lv,
        unitLabel: unitLabel(l),
        title: l.title,
        subtitle: l.topic,
        kind: "lessons",
        lessonIds: [l.id],
      });
    }
    plan.push({ n: ++n, phase: lv, unitLabel: `${lv.toUpperCase()} · Level test`, title: `${lv.toUpperCase()} Level Test`, subtitle: `Prove you have ${lv.toUpperCase()} locked in`, kind: "level-test", lessonIds: [] });
  }

  SPECIAL.exam.forEach((d) => {
    plan.push({ n: ++n, phase: "exam", unitLabel: "Exam prep", title: d.title, subtitle: d.goal, kind: "special", lessonIds: [] });
  });

  cache = plan;
  return plan;
}

function reviewQuestions(lessonIds: string[], perLesson: number): Question[] {
  const out: Question[] = [];
  for (const id of lessonIds) {
    const quiz = NOTES[id]?.quiz ?? [];
    const pool = quiz.filter((q) => q.src === "grammar" || q.src === "vocab");
    pool.slice(0, perLesson).forEach((q) => out.push({ ...q, src: "review" }));
  }
  return out;
}

export function getDay(n: number): DayContent | null {
  const plan = getPlan();
  const p = plan.find((d) => d.n === n);
  if (!p) return null;

  if (p.kind === "level-test") {
    const sp = SPECIAL.tests[p.phase] ?? null;
    return { ...p, lessons: [], special: sp, extra: null, quiz: sp?.quiz ?? [], minutes: 30 };
  }
  if (p.kind === "special") {
    const idx = n - plan.filter((d) => d.phase !== "exam").length - 1;
    const sp = SPECIAL.exam[idx] ?? null;
    const minutes = (sp?.materials ?? []).reduce((a, m) => a + m.minutes, 0) + 15;
    return { ...p, lessons: [], special: sp, extra: null, quiz: sp?.quiz ?? [], minutes };
  }

  const lessons: DayLesson[] = p.lessonIds.map((id) => ({
    lesson: LESSONS.find((l) => l.id === id)!,
    notes: NOTES[id] ?? null,
  }));
  const extra = EXTRAS[String(n)] ?? null;

  const quiz: Question[] = [];
  lessons.forEach((l) => quiz.push(...(l.notes?.quiz ?? [])));
  if (extra) quiz.push(...extra.questions.map((q) => ({ ...q, src: "extra" as const })));

  const first = lessons[0].lesson;
  if (p.phase === "a1") {
    const second = plan.find((d) => d.n === n - 1);
    if (second && second.kind === "lessons" && second.unitLabel === p.unitLabel && first.n % 4 === 3) {
      quiz.push(...reviewQuestions(second.lessonIds, 2));
    }
  } else if (first.n % 4 === 0) {
    const prev = LESSONS.filter((l) => l.level === first.level && l.unit === first.unit && l.n < first.n).map((l) => l.id);
    quiz.push(...reviewQuestions(prev, 1));
  }

  const perLesson = p.phase === "a1" ? 12 : p.phase === "a2" ? 15 : 20;
  const minutes = 5 + perLesson * lessons.length + (extra?.minutes ?? 0) + Math.ceil(quiz.length * 0.6);
  return { ...p, lessons, special: null, extra, quiz, minutes };
}

export interface ScheduleItem {
  n: number;
  phase: Phase;
  unitLabel: string;
  title: string;
  subtitle: string;
}

export function getSchedule(): ScheduleItem[] {
  return getPlan().map(({ n, phase, unitLabel, title, subtitle }) => ({ n, phase, unitLabel, title, subtitle }));
}
