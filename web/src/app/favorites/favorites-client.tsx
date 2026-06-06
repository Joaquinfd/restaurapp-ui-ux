"use client";

import { MOCK_RESTAURANTS } from "@/lib/constants";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { useUser } from "@/hooks/use-user";
import { PageContainer } from "@/components/layout/page-container";

export default function FavoritesClient() {
  const { user } = useUser();
  const { favorites } = user;

  const favoriteRestaurants = MOCK_RESTAURANTS.filter((r) => favorites.includes(r.id));

  return (
    <PageContainer className="py-8">
      <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">Mis Favoritos</h1>
      <p className="mb-8 text-neutral-500 dark:text-neutral-400">
        {favorites.length === 0
          ? "Aún no tienes restaurantes favoritos."
          : `${favorites.length} restaurante${favorites.length !== 1 ? "s" : ""} guardado${favorites.length !== 1 ? "s" : ""}.`}
      </p>

      <RestaurantList
        restaurants={favoriteRestaurants}
        emptyMessage="Explora restaurantes y agrega tus favoritos ♥"
      />
    </PageContainer>
  );
}
