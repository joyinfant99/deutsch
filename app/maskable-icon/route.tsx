import { iconImage } from "@/lib/iconArt";

export const dynamic = "force-static";

export async function GET() {
  return iconImage(512, { safe: true });
}
