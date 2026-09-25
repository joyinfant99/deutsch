import ProgressView from "@/components/ProgressView";
import { getSchedule } from "@/lib/course";

export default function ProgressPage() {
  return <ProgressView schedule={getSchedule()} />;
}
