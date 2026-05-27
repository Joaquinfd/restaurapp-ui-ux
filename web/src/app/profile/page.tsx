import type { Metadata } from "next";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
