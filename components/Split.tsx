import type { CSSProperties, ElementType } from "react";

/** Headline whose words rise out of a mask, one after another. Server-rendered, so it reads fine without JavaScript. */
export function Split({ text, as: Tag = "h2", className = "", delay = 0 }: { text: string; as?: ElementType; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <Tag className={`rv-off ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="split-w"><span style={{ "--d": `${delay + i * 70}ms` } as CSSProperties}>{w}</span>{i < words.length - 1 ? " " : ""}</span>
      ))}
    </Tag>
  );
}
