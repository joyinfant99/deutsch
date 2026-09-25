import { iconImage } from "@/lib/iconArt";

export function generateImageMetadata() {
  return [
    { id: "48", size: { width: 48, height: 48 }, contentType: "image/png" },
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const which = String(await id);
  return iconImage(Number(which), { rounded: true });
}
