import type { Metadata } from "next";
import { MOCK_GROUPS } from "@/lib/constants";
import GroupDetailClient from "./group-detail-client";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GroupDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const group = MOCK_GROUPS.find((g) => g.id === id);
  return {
    title: group ? group.name : "Grupo",
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;
  return <GroupDetailClient id={id} />;
}
