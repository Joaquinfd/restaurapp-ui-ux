"use client";

import { MOCK_RESTAURANTS } from "@/lib/constants";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();

  const favoriteRestaurants = MOCK_RESTAURANTS.filter((r) => favorites.includes(r.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">Mis Favoritos</h1>
      <p className="mb-8 text-neutral-500 dark:text-neutral-400">
        {favorites.length === 0
          ? "Aún no tienes restaurantes favoritos."
          : `${favorites.length} restaurante${favorites.length !== 1 ? "s" : ""} guardado${favorites.length !== 1 ? "s" : ""}.`}
      </p>

      {favorites.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => favorites.forEach((id) => toggle(id))}
            className="text-sm text-red-500 hover:text-red-600 hover:underline"
          >
            Quitar todos
          </button>
        </div>
      )}

      <RestaurantList
        restaurants={favoriteRestaurants}
        emptyMessage="Explora restaurantes y agrega tus favoritos ♥"
      />
    </div>
  );
}
