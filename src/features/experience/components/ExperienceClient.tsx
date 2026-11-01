"use client";

import { ExperienceDetail } from "@/features/experience/components/ExperienceDetail";
import type { Experience, ScreenState } from "@/types/experience";

type ExperienceClientProps = {
  experience: Experience;
  state?: ScreenState;
};

export function ExperienceClient({
  experience,
  state = "populated",
}: ExperienceClientProps) {
  return <ExperienceDetail experience={experience} state={state} />;
}
