import type { Metadata } from "next";
import { RestaurantForm } from "@/components/restaurant-form";

export const metadata: Metadata = {
  title: "Editar Restaurante",
};

interface RestaurantEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantEditorPage({ params }: RestaurantEditorPageProps) {
  const { id } = await params;
  return <RestaurantForm mode="edit" restaurantId={id} />;
}
