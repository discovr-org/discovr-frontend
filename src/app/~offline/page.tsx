import type { Metadata } from "next";
import { OfflineScreen } from "@/features/home/components/OfflineScreen";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Saved experiences still work.",
};

export default function OfflinePage() {
  return <OfflineScreen />;
}
