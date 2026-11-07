import type { Metadata } from "next";
import { ProfileScreen } from "@/features/profile/components/ProfileScreen";

export const metadata: Metadata = {
  title: "Account",
  description: "Your discovr account and profile.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
