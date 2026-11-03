"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CardList, CardProps } from "../utils/events";

type ListContext = Pick<
  CardProps,
  "list" | "section_id" | "section_title" | "layout" | "search_query"
>;

const TrackListContext = createContext<ListContext | null>(null);

/** Tells every card inside which list and section it sits in, for card events. */
export function TrackList({
  list,
  sectionId,
  sectionTitle,
  layout,
  searchQuery,
  children,
}: {
  list: CardList;
  sectionId?: string;
  sectionTitle?: string;
  layout?: CardProps["layout"];
  searchQuery?: string;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      list,
      section_id: sectionId,
      section_title: sectionTitle,
      layout,
      search_query: searchQuery,
    }),
    [list, sectionId, sectionTitle, layout, searchQuery],
  );
  return <TrackListContext.Provider value={value}>{children}</TrackListContext.Provider>;
}

export function useTrackList(): ListContext | null {
  return useContext(TrackListContext);
}
