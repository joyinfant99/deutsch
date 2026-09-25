import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { AuthProvider } from "@/lib/auth";
import AuthGate from "@/components/AuthGate";
import Sidebar, { type PhaseInfo } from "@/components/Sidebar";
import Tutor from "@/components/Tutor";
import InstallHint from "@/components/InstallHint";
import { getSchedule } from "@/lib/course";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf6ef",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  applicationName: "Deutsch",
  appleWebApp: { capable: true, title: "Deutsch", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  other: { "mobile-web-app-capable": "yes", "apple-mobile-web-app-capable": "yes" },
  title: "Deutsch – Daily Workbook",
  description: "A daily German workbook from A1 to B1, with lessons, materials and exams.",
};

const PHASES: Omit<PhaseInfo, "first" | "last">[] = [
  { key: "a1", label: "A1", sub: "Reactivation", color: "var(--a1)" },
  { key: "a2", label: "A2", sub: "Building", color: "var(--a2)" },
  { key: "b1", label: "B1", sub: "Independence", color: "var(--b1)" },
  { key: "exam", label: "Exam prep", sub: "Goethe B1", color: "var(--exam)" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  const schedule = getSchedule();
  const phases: PhaseInfo[] = PHASES.map((p) => {
    const days = schedule.filter((s) => s.phase === p.key).map((s) => s.n);
    return { ...p, first: Math.min(...days), last: Math.max(...days) };
  });
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-dvh">
        <AuthProvider>
        <AuthGate>
        <ProgressProvider>
          <div className="flex min-h-dvh flex-col lg:flex-row">
            <Sidebar phases={phases} total={schedule.length} />
            <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
          </div>
          <Tutor titles={schedule.map((s) => s.title)} />
          <InstallHint />
        </ProgressProvider>
        </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
