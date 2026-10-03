import ProgressView from "@/components/screens/ProgressView";
import { getSchedule } from "@/lib/course/course";

export default function ProgressPage() {
  return <ProgressView schedule={getSchedule()} />;
}
