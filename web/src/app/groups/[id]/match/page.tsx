import type { Metadata } from "next";
import { MOCK_GROUPS } from "@/lib/constants";
import GroupMatchClient from "./match-client";

type GroupMatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GroupMatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const group = MOCK_GROUPS.find((g) => g.id === id);
  return {
    title: group ? `Match · ${group.name}` : "Match grupal",
  };
}

export default async function GroupMatchPage({ params }: GroupMatchPageProps) {
  const { id } = await params;
  return <GroupMatchClient id={id} />;
}
