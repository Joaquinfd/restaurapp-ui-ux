import type { Metadata } from "next";
import { RestaurantForm } from "@/components/restaurant-form";

export const metadata: Metadata = {
  title: "Nuevo Restaurante",
};

export default function NewRestaurantPage() {
  return <RestaurantForm mode="create" />;
}
