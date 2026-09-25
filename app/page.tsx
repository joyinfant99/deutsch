import Dashboard from "@/components/Dashboard";
import { getSchedule } from "@/lib/course";

export default function Home() {
  return <Dashboard schedule={getSchedule()} />;
}
