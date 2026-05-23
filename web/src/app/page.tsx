"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { useFiltersStore } from "@/store/filters.store";
import { applyFilters } from "@/lib/filters";

const FEATURED = MOCK_RESTAURANTS.slice(0, 3);

export default function HomePage() {
  const { category, priceRanges, dietaryTags, minRating, setCategory } = useFiltersStore(
    useShallow((s) => s),
  );

  const hasActiveFilters = !!(category || priceRanges.length || dietaryTags.length || minRating);

  const filtered = useMemo(() => applyFilters(MOCK_RESTAURANTS, { category }), [category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
          Descubre tu próximo restaurante favorito
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
          Explora los mejores restaurantes de tu ciudad, filtra por tipo de cocina y encuentra el
          lugar perfecto para tu próxima comida.
        </p>
        <div className="mx-auto max-w-xl">
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Categorías</h2>
        <CategoryFilter selected={category} onSelect={setCategory} />
      </section>

      {/* Featured / Filtered */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
          {hasActiveFilters ? "Resultados" : "Restaurantes destacados"}
        </h2>
        <RestaurantList
          restaurants={hasActiveFilters ? filtered : FEATURED}
          emptyMessage="No hay restaurantes en esta categoría."
        />
      </section>
    </div>
  );
}
