import type { Metadata } from "next";
import { SavedScreen } from "@/features/saved/components/SavedScreen";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your saved discovr experiences.",
};

export default function SavedPage() {
  return <SavedScreen />;
}
