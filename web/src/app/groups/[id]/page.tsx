import GroupDetailClient from "./group-detail-client";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;

  return <GroupDetailClient id={id} />;
}
