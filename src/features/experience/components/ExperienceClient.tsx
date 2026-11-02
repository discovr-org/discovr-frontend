"use client";

import { ExperienceDetail } from "@/features/experience/components/ExperienceDetail";
import type { FeedItem } from "@/features/home/utils/feedData";
import type { Experience, ScreenState } from "@/types/experience";

type ExperienceClientProps = {
  experience: Experience;
  state?: ScreenState;
  relatedItems?: FeedItem[];
};

export function ExperienceClient({
  experience,
  state = "populated",
  relatedItems = [],
}: ExperienceClientProps) {
  return (
    <ExperienceDetail
      experience={experience}
      state={state}
      relatedItems={relatedItems}
    />
  );
}
