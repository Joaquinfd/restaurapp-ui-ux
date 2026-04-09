"use client";

import { useState } from "react";
import { CATEGORIES, MOCK_RESTAURANTS } from "@/lib/constants";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import { RestaurantList } from "@/components/restaurants/restaurant-list";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featured = MOCK_RESTAURANTS.slice(0, 3);
  const filtered = selectedCategory
    ? MOCK_RESTAURANTS.filter((r) => {
        const cat = CATEGORIES.find((c) => c.slug === selectedCategory);
        return cat && r.cuisine === cat.name;
      })
    : MOCK_RESTAURANTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
          Descubre tu próximo restaurante favorito
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
          Explora los mejores restaurantes de tu ciudad, filtra por tipo de cocina y encuentra el lugar perfecto para tu próxima comida.
        </p>
        <div className="mx-auto max-w-xl">
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Categorías</h2>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </section>

      {/* Featured / Filtered */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
          {selectedCategory ? "Resultados" : "Restaurantes destacados"}
        </h2>
        <RestaurantList
          restaurants={selectedCategory ? filtered : featured}
          emptyMessage="No hay restaurantes en esta categoría."
        />
      </section>
    </div>
  );
}
