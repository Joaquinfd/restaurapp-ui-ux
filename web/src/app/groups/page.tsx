import type { Metadata } from "next";
import GroupsClient from "./groups-client";

export const metadata: Metadata = {
  title: "Grupos",
};

export default function GroupsPage() {
  return <GroupsClient />;
}
