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

const send = (message: Record<string, unknown>) => window.parent.postMessage(message, "*");
const MOVABLE = /^(part:(title|info|verdict|actions|about|menu|policy|host|reviews)|block:\d+)$/;
const kindOf = (id: string) => id.split(":")[0];
const idOf = (el: Element | null) => el?.closest<HTMLElement>("[data-pv]")?.dataset.pv ?? null;

export function ExperiencePreview() {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [related, setRelated] = useState<FeedItem[]>([]);
  const [editor, setEditor] = useState<EditorState>({ selected: null, hover: null, arranging: false });
  const root = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: string; x: number; y: number; timer: number; dragging: boolean; over: string | null } | null>(null);
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
    if (editor.selected) el.querySelector(`[data-pv="${editor.selected}"]`)?.setAttribute("data-pv-on", "");
    if (editor.hover && editor.hover !== editor.selected) el.querySelector(`[data-pv="${editor.hover}"]`)?.setAttribute("data-pv-hover", "");
  });

  const clearOver = () => root.current?.querySelectorAll("[data-pv-over],[data-pv-drag]").forEach((n) => {
    n.removeAttribute("data-pv-over");
    n.removeAttribute("data-pv-drag");
  });

  function onPointerDown(e: ReactPointerEvent) {
    const id = idOf(e.target as Element);
    if (!id || e.button !== 0) return;
    const entry = { id, x: e.clientX, y: e.clientY, dragging: false, over: null as string | null, timer: 0 };
    // Hold a part to start arranging, like the home screen.
    if (!editor.arranging && MOVABLE.test(id)) entry.timer = window.setTimeout(() => send({ type: "pv:arrange", on: true }), 420);
    press.current = entry;
  }

  function onPointerMove(e: ReactPointerEvent) {
    const p = press.current;
    if (!p) return;
    if (!p.dragging && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5) {
      window.clearTimeout(p.timer);
      if (editor.arranging && MOVABLE.test(p.id)) {
        p.dragging = true;
        root.current?.querySelector(`[data-pv="${p.id}"]`)?.setAttribute("data-pv-drag", "");
      }
    }
    if (!p.dragging) return;
    // Let the page scroll while dragging near an edge.
    if (e.clientY < 70) window.scrollBy(0, -14);
    else if (e.clientY > window.innerHeight - 90) window.scrollBy(0, 14);
    const target = idOf(document.elementFromPoint(e.clientX, e.clientY));
    root.current?.querySelectorAll("[data-pv-over]").forEach((n) => n.removeAttribute("data-pv-over"));
    p.over = target && target !== p.id && MOVABLE.test(target) && kindOf(target) === kindOf(p.id) ? target : null;
    if (p.over) root.current?.querySelector(`[data-pv="${p.over}"]`)?.setAttribute("data-pv-over", "");
  }

  function onPointerUp() {
    const p = press.current;
    press.current = null;
    if (!p) return;
    window.clearTimeout(p.timer);
    if (p.dragging) {
      suppressClick.current = true;
      if (p.over) send({ type: "pv:move", from: p.id, to: p.over });
    }
    clearOver();
  }

  function onClickCapture(e: React.MouseEvent) {
    // Nothing in the preview navigates, opens sheets, or toggles.
    e.preventDefault();
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
