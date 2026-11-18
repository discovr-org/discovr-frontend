import type { Experience, LayoutBlock, StoryBlock } from "@/types/experience";

/**
 * A category's story layout, filled from one listing. Blocks whose field is empty are left out,
 * so a listing never shows an empty card. Returns each block with its place in the layout.
 */
export function resolveLayout(x: Experience, layout: LayoutBlock[]): Array<{ block: StoryBlock; index: number }> {
  const out: Array<{ block: StoryBlock; index: number }> = [];
  layout.forEach((b, index) => {
    if (b.show === false) return;
    if (b.when && isEmpty(valueOf(x, b.when))) return;
    const block = resolveBlock(x, b);
    if (block) out.push({ block: { ...block, ...(b.size === "half" ? { size: "half" as const } : {}), ...(b.space ? { space: b.space } : {}), ...(b.hide ? { hide: b.hide } : {}) }, index });
  });
  return out;
}

/** The value of a listing field by key. `title`, `about`, `verdict` are the listing's own, `ageGroup` and `bestTime` come from its hours; the rest live in `content`. */
function valueOf(x: Experience, key: string | undefined): unknown {
  if (!key) return undefined;
  if (key === "title") return x.title;
  if (key === "about") return x.about;
  if (key === "verdict") return x.verdict;
  if (key === "ageGroup" || key === "bestTime") return x.hours?.[key];
  const [name, index] = key.split(".");
  const v = (x.content as Record<string, unknown> | undefined)?.[name];
  return index !== undefined && Array.isArray(v) ? v[Number(index)] : v;
}

function isEmpty(v: unknown): boolean {
  if (Array.isArray(v)) return v.every((i) => (typeof i === "string" ? !i.trim() : !i || (typeof i === "object" && Object.values(i).every((f) => !String(f ?? "").trim()))));
  if (v && typeof v === "object") return Object.values(v).every((f) => !String(f ?? "").trim());
  return !String(v ?? "").trim();
}

const text = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const lines = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split("\n") : []).filter((s): s is string => typeof s === "string").map((s) => s.trim()).filter(Boolean);
const rows = (v: unknown): Array<Record<string, unknown>> =>
  Array.isArray(v) ? v.filter((r): r is Record<string, unknown> => !!r && typeof r === "object") : [];

function resolveBlock(x: Experience, b: LayoutBlock): StoryBlock | null {
  switch (b.type) {
    case "line":
      return { type: "line" };
    case "heading": {
      const t = b.source ? text(valueOf(x, b.source)) : text(b.text);
      return t ? { type: "heading", level: b.level, text: t } : null;
    }
    case "text": {
      const body = b.source ? text(valueOf(x, b.source)) : text(b.text);
      if (!body) return null;
      const paragraphs = body.split(/\n{2,}/).map((p) => ({ text: p.trim() })).filter((p) => p.text);
      return { type: "text", paragraphs: b.label ? [{ text: b.label, strong: true }, ...paragraphs] : paragraphs };
    }
    case "quote": {
      const t = b.source ? text(valueOf(x, b.source)) : text(b.text);
      return t ? { type: "quote", text: t, plain: true } : null;
    }
    case "checklist": {
      const items = lines(valueOf(x, b.source));
      return items.length ? { type: "checklist", title: b.title, items } : null;
    }
    case "forNotFor": {
      const columns = b.columns.map((c) => ({ title: c.title, tone: c.tone, items: lines(valueOf(x, c.source)) })).filter((c) => c.items.length);
      return columns.length ? { type: "forNotFor", columns } : null;
    }
    case "callout": {
      const paragraphs = lines(b.source ? valueOf(x, b.source) : b.text);
      return paragraphs.length ? { type: "callout", tone: b.tone, title: b.title, paragraphs } : null;
    }
    case "faq": {
      const items = rows(valueOf(x, b.source ?? "faqs")).map((r) => ({ q: text(r.q), a: text(r.a) })).filter((r) => r.q && r.a);
      return items.length ? { type: "faq", items } : null;
    }
    case "steps": {
      const items = rows(valueOf(x, b.source ?? "steps"))
        .map((r, i) => ({ marker: text(r.marker) || String(i + 1), title: text(r.title), ...(text(r.caption) ? { caption: text(r.caption) } : {}) }))
        .filter((r) => r.title);
      return items.length ? { type: "steps", items } : null;
    }
    case "stats": {
      const items = b.tiles.map((t) => ({ label: t.label, value: text(valueOf(x, t.source)) })).filter((t) => t.value);
      return items.length ? { type: "stats", items } : null;
    }
    case "packages": {
      const items = rows(valueOf(x, b.source ?? "packages"))
        .map((r) => ({ name: text(r.name), price: text(r.price), ...(text(r.detail) ? { detail: text(r.detail) } : {}) }))
        .filter((r) => r.name);
      return items.length ? { type: "packages", ...(b.title ? { title: b.title } : {}), items } : null;
    }
    case "photo": {
      const p = valueOf(x, b.source) as { src?: unknown; alt?: unknown; caption?: unknown } | undefined;
      const src = text(p?.src);
      return src ? { type: "photo", src, alt: text(p?.alt), ...(text(p?.caption) ? { caption: text(p?.caption) } : {}) } : null;
    }
  }
}
