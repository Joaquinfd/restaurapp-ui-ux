"use client";

import { CreateForm } from "./create-form";
import { EditForm } from "./edit-form";

interface RestaurantFormProps {
  mode: "create" | "edit";
  restaurantId?: string;
}

export function RestaurantForm({ mode, restaurantId }: RestaurantFormProps) {
  if (mode === "create") return <CreateForm />;
  return <EditForm restaurantId={restaurantId!} />;
}
