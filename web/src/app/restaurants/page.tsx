"use client";

import { useState } from "react";
import { CATEGORIES, MOCK_RESTAURANTS } from "@/lib/constants";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { SearchBar } from "@/components/search/search-bar";

export default function RestaurantsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? MOCK_RESTAURANTS.filter((r) => {
        const cat = CATEGORIES.find((c) => c.slug === selectedCategory);
        return cat && r.cuisine === cat.name;
      })
    : MOCK_RESTAURANTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Restaurantes</h1>
        <div className="w-full sm:max-w-sm">
          <SearchBar placeholder="Buscar..." />
        </div>
      </div>

      <div className="mb-8">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <RestaurantList restaurants={filtered} />
    </div>
  );
}
