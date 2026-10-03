import { ImageResponse } from "next/og";

const TEAL = "#1d4b47";
const CREAM = "#faf6ef";
const TERRA = "#c1703f";

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&text=D", {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/** Teal tile, cream italic "D", terracotta full stop – the app's logo mark. */
export async function iconImage(px: number, opts: { rounded?: boolean; safe?: boolean } = {}) {
  const font = await loadFont();
  const glyph = px * (opts.safe ? 0.5 : 0.66);
  const dot = px * (opts.safe ? 0.075 : 0.095);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: TEAL,
          borderRadius: opts.rounded ? px * 0.22 : 0,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", color: CREAM, fontSize: glyph, lineHeight: 1, fontStyle: "italic", fontFamily: font ? "Playfair" : "serif", marginTop: -glyph * 0.04 }}>
          D
          <div style={{ width: dot, height: dot, borderRadius: dot, background: TERRA, marginLeft: glyph * 0.05, marginBottom: glyph * 0.1 }} />
        </div>
      </div>
    ),
    {
      width: px,
      height: px,
      ...(font ? { fonts: [{ name: "Playfair", data: font, style: "italic" as const, weight: 500 as const }] } : {}),
    },
  );
}
