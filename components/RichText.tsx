import { Fragment } from "react";

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className={`prose-lite text-[15px] leading-relaxed ${className}`}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

const ARTICLE = /^(der|die|das)\b/i;
const ARTICLE_COLOR: Record<string, string> = { der: "#2563a8", die: "#b83232", das: "#2f7d4f" };

export function German({ text, className = "" }: { text: string; className?: string }) {
  const m = text.match(ARTICLE);
  if (!m) return <span className={className}>{text}</span>;
  const art = m[1].toLowerCase();
  return (
    <span className={className}>
      <span style={{ color: ARTICLE_COLOR[art] }}>{text.slice(0, m[1].length)}</span>
      {text.slice(m[1].length)}
    </span>
  );
}
