import { firebaseConfig, USERS_COLLECTION } from "./firebase";

const base = (uid: string) =>
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${USERS_COLLECTION}/${encodeURIComponent(uid)}`;

export class CloudUnavailable extends Error {}

export interface CloudDoc {
  progressJson: string | null;
  chatsJson: string | null;
}

async function call(url: string, init: RequestInit, ms = 12000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } catch {
    throw new CloudUnavailable("network");
  } finally {
    clearTimeout(t);
  }
}

const str = (f: unknown) => (f as { stringValue?: string } | undefined)?.stringValue ?? null;

/** Reads this user's saved data. Missing document = brand new user (both fields null). */
export async function readCloud(token: string, uid: string): Promise<CloudDoc> {
  const r = await call(base(uid), { headers: { Authorization: `Bearer ${token}` } });
  if (r.ok) {
    const j = await r.json();
    return { progressJson: str(j.fields?.progressJson), chatsJson: str(j.fields?.chatsJson) };
  }
  const j = await r.json().catch(() => ({}));
  const msg = String(j.error?.message ?? "");
  if (r.status === 404 && /^Document /i.test(msg)) return { progressJson: null, chatsJson: null };
  throw new CloudUnavailable(`${r.status} ${msg}`.slice(0, 160));
}

export async function writeCloud(
  token: string,
  uid: string,
  fields: { progressJson?: string; chatsJson?: string },
  keepalive = false,
): Promise<void> {
  const names = Object.keys(fields);
  const mask = [...names, "updatedAt"].map((n) => `updateMask.fieldPaths=${n}`).join("&");
  const body: Record<string, unknown> = { updatedAt: { timestampValue: new Date().toISOString() } };
  for (const n of names) body[n] = { stringValue: fields[n as keyof typeof fields] };
  const r = await call(`${base(uid)}?${mask}`, {
    method: "PATCH",
    keepalive,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: body }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new CloudUnavailable(`${r.status} ${String(j.error?.message ?? "")}`.slice(0, 160));
  }
}
