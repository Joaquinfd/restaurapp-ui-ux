"use client";

import { use } from "react";
import { RestaurantForm } from "@/components/restaurant-form";

export default function RestaurantEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RestaurantForm mode="edit" restaurantId={id} />;
}
