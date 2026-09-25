import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1d4b47", color: "#faf6ef", fontSize: 300, fontStyle: "italic", fontFamily: "serif" }}>
        D
      </div>
    ),
    size,
  );
}
