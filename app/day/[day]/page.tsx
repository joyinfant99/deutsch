import { notFound } from "next/navigation";
import DayView from "@/components/DayView";
import { getDay, getPlan } from "@/lib/course";

export default async function DayPage({ params }: PageProps<"/day/[day]">) {
  const { day } = await params;
  const n = Number(day);
  const content = Number.isInteger(n) ? getDay(n) : null;
  if (!content) notFound();
  return <DayView day={content} total={getPlan().length} />;
}
