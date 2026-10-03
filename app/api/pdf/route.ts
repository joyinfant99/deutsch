// Proxies allow-listed PDFs and serves them inline, so they render in the page
// instead of downloading (the source sends Content-Disposition: attachment).
const ALLOWED_HOSTS = new Set(["static.dw.com"]);

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  let target: URL;
  try {
    target = new URL(raw ?? "");
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname) || !target.pathname.toLowerCase().endsWith(".pdf")) {
    return new Response("Not allowed", { status: 403 });
  }
  const upstream = await fetch(target, { redirect: "error" });
  if (!upstream.ok || !upstream.body) return new Response("Upstream error", { status: 502 });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
