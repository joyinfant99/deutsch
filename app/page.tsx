import Dashboard from "@/components/screens/Dashboard";
import { getSchedule } from "@/lib/course/course";

export default function Home() {
  return <Dashboard schedule={getSchedule()} />;
}
