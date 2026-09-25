import { notFound } from "next/navigation";
import ExamView from "@/components/ExamView";
import { getDay, getPlan } from "@/lib/course";

export default async function ExamPage({ params }: PageProps<"/day/[day]/exam">) {
  const { day } = await params;
  const n = Number(day);
  const content = Number.isInteger(n) ? getDay(n) : null;
  if (!content || content.quiz.length === 0) notFound();
  return <ExamView n={content.n} title={content.title} phase={content.phase} quiz={content.quiz} total={getPlan().length} />;
}
