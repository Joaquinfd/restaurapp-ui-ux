import type { Metadata } from "next";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { RestaurantDetailView } from "@/components/restaurants/restaurant-detail-view";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RestaurantDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id);
  return {
    title: restaurant ? restaurant.name : "Restaurante",
  };
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  return <RestaurantDetailView id={id} />;
}
