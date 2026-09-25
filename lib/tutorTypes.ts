import type { Progress } from "./types";

export interface TutorMsg {
  role: "user" | "assistant";
  content: string;
}

export type TutorMode = "study" | "exam" | "overview";

export interface TutorRequest {
  day: number;
  mode: TutorMode;
  today: string;
  progress: Progress;
  messages: TutorMsg[];
}
