import type { Metadata } from "next";
import { SearchScreen } from "@/features/home/components/SearchScreen";

export const metadata: Metadata = {
  title: "Search",
  description: "Search discovr for trips, food and drink worth doing tonight.",
};

export default function SearchPage() {
  return <SearchScreen />;
}
