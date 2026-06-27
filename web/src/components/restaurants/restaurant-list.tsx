"use client";

import { useState } from "react";
import type { Restaurant } from "@/types";
import { RestaurantCard } from "./restaurant-card";
import { QuickMenuModal } from "./quick-menu-modal";

interface RestaurantListProps {
  restaurants: Restaurant[];
  emptyMessage?: string;
}

export function RestaurantList({
  restaurants,
  emptyMessage = "No se encontraron restaurantes.",
}: RestaurantListProps) {
  const [quickViewRestaurant, setQuickViewRestaurant] = useState<Restaurant | null>(null);

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="mb-4 text-5xl">🔍</span>
        <p className="text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onQuickView={setQuickViewRestaurant}
          />
        ))}
      </div>

      {quickViewRestaurant && (
        <QuickMenuModal
          restaurant={quickViewRestaurant}
          onClose={() => setQuickViewRestaurant(null)}
        />
      )}
    </>
  );
}
