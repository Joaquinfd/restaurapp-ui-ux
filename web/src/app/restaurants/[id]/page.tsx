import { RestaurantDetailView } from "@/components/restaurants/restaurant-detail-view";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  return <RestaurantDetailView id={id} />;
}
