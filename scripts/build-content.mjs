import fs from "node:fs";
import path from "node:path";

const dir = "content/src";
const files = fs.readdirSync(dir).sort();
const lessons = {};
const extras = {};
const special = { tests: {}, exam: [] };
const problems = [];

const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

for (const f of files) {
  if (!f.endsWith(".json")) continue;
  let data;
  try {
    data = readJSON(f);
  } catch (e) {
    problems.push(`${f}: invalid JSON: ${e.message}`);
    continue;
  }
  if (f.startsWith("lessons-")) Object.assign(lessons, data);
  else if (f.startsWith("extras-")) Object.assign(extras, data);
  else if (f.startsWith("tests-")) Object.assign(special.tests, data);
  else if (f.startsWith("exam-")) special.exam.push(...data);
}

function checkQ(where, q) {
  if (!q.q || typeof q.q !== "string") problems.push(`${where}: question text missing`);
  if (q.t === "mc") {
    if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 5) problems.push(`${where}: bad options: ${q.q}`);
    else if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.o.length) problems.push(`${where}: bad answer index: ${q.q}`);
    else if (new Set(q.o.map((x) => x.trim())).size !== q.o.length) problems.push(`${where}: duplicate options: ${q.q}`);
  } else if (q.t === "fill") {
    if (!Array.isArray(q.a) || q.a.length === 0 || q.a.some((x) => !x)) problems.push(`${where}: bad fill answers: ${q.q}`);
    if (!/___/.test(q.q)) problems.push(`${where}: fill question has no ___ blank: ${q.q}`);
  } else problems.push(`${where}: unknown type ${q.t}`);
}

const nicos = JSON.parse(fs.readFileSync("content/nicos.json", "utf8"));
const missing = [];
for (const l of nicos) {
  const n = lessons[l.id];
  if (!n) { missing.push(l.id); continue; }
  if (!n.goal) problems.push(`${l.id}: no goal`);
  if (!Array.isArray(n.words) || n.words.length < 6) problems.push(`${l.id}: fewer than 6 words`);
  if (!Array.isArray(n.quiz) || n.quiz.length < 5) problems.push(`${l.id}: fewer than 5 quiz questions`);
  (n.quiz || []).forEach((q, i) => checkQ(`${l.id}#${i + 1}`, q));
  if (n.grammar && (!n.grammar.title || !n.grammar.text)) problems.push(`${l.id}: incomplete grammar`);
}
for (const id of Object.keys(lessons)) if (!nicos.find((l) => l.id === id)) problems.push(`${id}: unknown lesson id`);

for (const [day, e] of Object.entries(extras)) {
  if (!e.url?.startsWith("https://")) problems.push(`extra ${day}: bad url`);
  if (!e.title || !e.source || !e.focus || !e.minutes) problems.push(`extra ${day}: missing field`);
  if (!Array.isArray(e.questions) || e.questions.length < 2) problems.push(`extra ${day}: fewer than 2 questions`);
  (e.questions || []).forEach((q, i) => checkQ(`extra ${day}#${i + 1}`, q));
}
for (const [k, s] of Object.entries(special.tests)) (s.quiz || []).forEach((q, i) => checkQ(`test ${k}#${i + 1}`, q));
special.exam.forEach((s, d) => {
  (s.quiz || []).forEach((q, i) => checkQ(`exam ${d + 1}#${i + 1}`, q));
  (s.materials || []).forEach((m, i) => { if (!m.url?.startsWith("https://")) problems.push(`exam ${d + 1} material ${i + 1}: bad url`); });
});

fs.writeFileSync("content/lessons.json", JSON.stringify(lessons));
fs.writeFileSync("content/extras.json", JSON.stringify(extras));
fs.writeFileSync("content/special.json", JSON.stringify(special));

const qCount = Object.values(lessons).reduce((a, l) => a + l.quiz.length, 0);
console.log(`lessons written: ${Object.keys(lessons).length}/228 (${qCount} questions) · extras: ${Object.keys(extras).length} · level tests: ${Object.keys(special.tests).length} · exam-prep days: ${special.exam.length}`);
if (missing.length && process.argv.includes("--strict")) problems.push(`missing lessons: ${missing.length}`);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  problems.slice(0, 60).forEach((p) => console.log(" - " + p));
  process.exit(1);
}
console.log(process.argv.includes("--strict") ? "content OK" : `content OK so far · ${missing.length} lessons still to write`);
