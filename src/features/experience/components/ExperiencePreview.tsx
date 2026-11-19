"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { fetchCatalogCards, mapApiExperience } from "@/shared/utils/catalogApi";
import type { FeedItem } from "@/features/home/utils/feedData";
import type { Experience } from "@/types/experience";
import { ExperienceDetail } from "./ExperienceDetail";
import styles from "./ExperiencePreview.module.css";

/**
 * The admin editor's live preview: the real listing page, drawn from a draft the admin sends.
 * Messages in:  pv:data { experience } · pv:state { selected, hover, arranging } · pv:scroll { id }
 * Messages out: pv:ready · pv:select { id } · pv:hover { id } · pv:move { from, to } · pv:remove { id } · pv:arrange { on }
 * Only the framing window is listened to, and nothing here writes anywhere.
 */
type EditorState = { selected: string | null; hover: string | null; arranging: boolean };

const PART_LABEL: Record<string, string> = {
  gallery: "Photo gallery",
  title: "Title & price",
  info: "Price, place & hours",
  verdict: "Verdict",
  actions: "Action buttons",
  about: "About",
  menu: "Menu",
  policy: "Booking & cancellation",
  host: "Host card",
  reviews: "Reviews",
  more: "More in Goa",
  booking: "Booking bar",
};
const BLOCK_LABEL: Record<string, string> = {
  heading: "Heading",
  line: "Divider",
  quote: "Quote",
  text: "Text",
  photo: "Photo",
  forNotFor: "Included / Not included",
  steps: "Steps",
  callout: "Callout",
  checklist: "Checklist",
  faq: "FAQ",
  stats: "Stat tiles",
  packages: "Packages & prices",
};

const send = (message: Record<string, unknown>) => window.parent.postMessage(message, "*");
const MOVABLE = /^(part:(title|info|verdict|actions|about|menu|policy|host|reviews)|block:\d+)$/;
const kindOf = (id: string) => id.split(":")[0];
/**
 * Where a lifted item may land. Parts go among parts and blocks among blocks. A page part may also drop into the story
 * (onto a block), and a part that sits in the story may drop back onto a page row. About is the story itself.
 */
function canDrop(from: string, to: string, fromIsStoryPart: boolean): boolean {
  if (kindOf(from) === kindOf(to)) return true;
  if (kindOf(from) === "part") return kindOf(to) === "block" && from !== "part:about";
  return fromIsStoryPart && to !== "part:about";
}
const idOf = (el: Element | null) => el?.closest<HTMLElement>("[data-pv]")?.dataset.pv ?? null;

export function ExperiencePreview() {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [related, setRelated] = useState<FeedItem[]>([]);
  const [editor, setEditor] = useState<EditorState>({ selected: null, hover: null, arranging: false });
  const root = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: string; x: number; y: number; timer: number; dragging: boolean; over: string | null; after: boolean; ghost: HTMLElement | null; dx: number; dy: number } | null>(null);
  const line = useRef<HTMLDivElement | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    void fetchCatalogCards().then((cards) => setRelated(cards ?? []));
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const m = e.data as { type?: string; [k: string]: unknown } | null;
      if (m?.type === "pv:data") setExperience(mapApiExperience(m.experience as Parameters<typeof mapApiExperience>[0]));
      else if (m?.type === "pv:state") setEditor({ selected: (m.selected as string | null) ?? null, hover: (m.hover as string | null) ?? null, arranging: m.arranging === true });
      else if (m?.type === "pv:scroll" && typeof m.id === "string") {
        document.querySelector(`[data-pv="${m.id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    send({ type: "pv:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Mark the selected / hovered part after every render (the page replaces its nodes on each draft).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll("[data-pv-on],[data-pv-hover]").forEach((n) => {
      n.removeAttribute("data-pv-on");
      n.removeAttribute("data-pv-hover");
    });
    if (editor.selected) {
      const target = el.querySelector(`[data-pv="${editor.selected}"]`);
      const [kind, key] = editor.selected.split(":");
      const label = kind === "part" ? PART_LABEL[key] : BLOCK_LABEL[experience?.content?.blocks?.[Number(key)]?.type ?? ""];
      target?.setAttribute("data-pv-on", "");
      if (label) target?.setAttribute("data-pv-label", label);
    }
    if (editor.hover && editor.hover !== editor.selected) el.querySelector(`[data-pv="${editor.hover}"]`)?.setAttribute("data-pv-hover", "");
  });

  const endDrag = () => {
    root.current?.querySelectorAll("[data-pv-drag]").forEach((n) => n.removeAttribute("data-pv-drag"));
    press.current?.ghost?.remove();
    line.current?.remove();
    line.current = null;
  };

  function onPointerDown(e: ReactPointerEvent) {
    const id = idOf(e.target as Element);
    if (!id || e.button !== 0) return;
    const entry = { id, x: e.clientX, y: e.clientY, dragging: false, over: null as string | null, after: false, ghost: null as HTMLElement | null, dx: 0, dy: 0, timer: 0 };
    // Hold a part to start arranging, like the home screen.
    if (!editor.arranging && MOVABLE.test(id)) entry.timer = window.setTimeout(() => send({ type: "pv:arrange", on: true }), 420);
    press.current = entry;
  }

  function onPointerMove(e: ReactPointerEvent) {
    const p = press.current;
    if (!p) return;
    if (!p.dragging && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5) {
      window.clearTimeout(p.timer);
      const el = root.current?.querySelector<HTMLElement>(`[data-pv="${p.id}"]`);
      if (editor.arranging && MOVABLE.test(p.id) && el) {
        p.dragging = true;
        const r = el.getBoundingClientRect();
        // The lifted copy follows the pointer; the original stays as a faded placeholder.
        const ghost = el.cloneNode(true) as HTMLElement;
        ghost.removeAttribute("data-pv");
        ghost.querySelectorAll("[data-pv]").forEach((n) => n.removeAttribute("data-pv"));
        ghost.className = `${styles.ghost}`;
        Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px` });
        document.body.appendChild(ghost);
        p.ghost = ghost;
        p.dx = p.x - r.left;
        p.dy = p.y - r.top;
        el.setAttribute("data-pv-drag", "");
      }
    }
    if (!p.dragging) return;
    if (p.ghost) p.ghost.style.transform = `translate(${e.clientX - p.x}px, ${e.clientY - p.y}px) rotate(1.2deg) scale(1.03)`;
    // Let the page scroll while dragging near an edge.
    if (e.clientY < 70) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
    // Find what is under the pointer (the lifted copy ignores pointer events).
    const target = idOf(document.elementFromPoint(e.clientX, e.clientY));
    const fromIsStoryPart = Boolean(root.current?.querySelector(`[data-pv="${p.id}"]`)?.hasAttribute("data-pv-part"));
    p.over = target && target !== p.id && MOVABLE.test(target) && canDrop(p.id, target, fromIsStoryPart) ? target : null;
    if (!p.over) {
      line.current?.remove();
      line.current = null;
      return;
    }
    const r = root.current!.querySelector(`[data-pv="${p.over}"]`)!.getBoundingClientRect();
    const sideBySide = r.width < window.innerWidth * 0.6;
    p.after = sideBySide ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
    if (!line.current) {
      line.current = document.createElement("div");
      line.current.className = styles.line;
      document.body.appendChild(line.current);
    }
    Object.assign(line.current.style, sideBySide
      ? { left: `${(p.after ? r.right : r.left) - 2}px`, top: `${r.top}px`, width: "4px", height: `${r.height}px` }
      : { left: `${r.left}px`, top: `${(p.after ? r.bottom : r.top) - 2}px`, width: `${r.width}px`, height: "4px" });
  }

  function onPointerUp() {
    const p = press.current;
    if (!p) return;
    window.clearTimeout(p.timer);
    if (p.dragging) {
      suppressClick.current = true;
      if (p.over) send({ type: "pv:move", from: p.id, to: p.over, after: p.after });
    }
    endDrag();
    press.current = null;
  }

  function onClickCapture(e: React.MouseEvent) {
    // Nothing in the preview navigates or opens sheets. A FAQ question may open and close, so the admin can read the answers.
    const opensFaq = !editor.arranging && Boolean((e.target as Element).closest("details > summary"));
    if (!opensFaq) e.preventDefault();
    e.stopPropagation();
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const id = idOf(e.target as Element);
    if (!id) return;
    if (editor.arranging && MOVABLE.test(id)) {
      // The corner badge removes the part (parts hide, blocks delete).
      const r = (e.target as Element).closest("[data-pv]")!.getBoundingClientRect();
      if (e.clientX - r.left < 30 && e.clientY - r.top < 30) return void send({ type: "pv:remove", id });
    }
    send({ type: "pv:select", id });
  }

  return (
    <div
      ref={root}
      className={`${styles.root} ${editor.arranging ? styles.arrange : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerOver={(e) => {
        const id = idOf(e.target as Element);
        if (id !== editor.hover) send({ type: "pv:hover", id });
      }}
      onPointerLeave={() => send({ type: "pv:hover", id: null })}
      onClickCapture={onClickCapture}
    >
      <ExperienceDetail experience={experience ?? undefined} state={experience ? "populated" : "loading"} relatedItems={related} preview />
    </div>
  );
}
