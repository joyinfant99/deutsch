export type Phase = "a1" | "a2" | "b1" | "exam";

export type Question =
  | { t: "mc"; q: string; o: string[]; a: number; why?: string; src?: QSource }
  | { t: "fill"; q: string; a: string[]; why?: string; src?: QSource };

export type QSource = "video" | "vocab" | "grammar" | "extra" | "review" | "reading";

export type Word = [german: string, english: string];
export type Pair = [german: string, english: string];

export interface LessonNotes {
  goal: string;
  words: Word[];
  grammar?: { title: string; text: string; ex?: Pair[] };
  phrases?: Pair[];
  quiz: Question[];
}

export interface NicosLesson {
  id: string;
  level: "a1" | "a2" | "b1";
  n: number;
  unit: number;
  unitName: string;
  title: string;
  topic: string;
  grammar: string;
  url: string;
  script: string | null;
}

export interface Extra {
  kind: "video" | "audio" | "article" | "pdf" | "exercise";
  title: string;
  source: string;
  url: string;
  minutes: number;
  focus: string;
  questions: Question[];
}

export interface NoteBlock {
  heading: string;
  text: string;
  table?: Pair[];
}

export interface SpecialDay {
  title: string;
  goal: string;
  notes: NoteBlock[];
  materials: Extra[];
  quiz: Question[];
}

export interface DayLesson {
  lesson: NicosLesson;
  notes: LessonNotes | null;
}

export interface DayPlan {
  n: number;
  phase: Phase;
  unitLabel: string;
  title: string;
  subtitle: string;
  kind: "lessons" | "level-test" | "special";
  lessonIds: string[];
}

export interface DayContent extends DayPlan {
  lessons: DayLesson[];
  special: SpecialDay | null;
  extra: Extra | null;
  quiz: Question[];
  minutes: number;
}

export interface MissedQuestion {
  q: string;
  yours: string;
  right: string;
  src?: QSource;
}

export interface Attempt {
  score: number;
  total: number;
  at: string;
  missed?: MissedQuestion[];
}

export interface DayProgress {
  checked: string[];
  attempts: Attempt[];
  best: number;
  completedAt?: string;
}

export interface Progress {
  startDate: string;
  days: Record<string, DayProgress>;
}

export const PASS_MARK = 0.7;
