"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { useFiltersStore, selectActiveCount } from "@/store/filters.store";
import { applyFilters } from "@/lib/filters";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { QuickDecision } from "@/components/restaurants/quick-decision";
import { SearchBar } from "@/components/search/search-bar";

export default function RestaurantsPage() {
  const { category, priceRanges, dietaryTags, minRating, setCategory, togglePrice, toggleDietary, setMinRating, clearAll } =
    useFiltersStore(useShallow((s) => s));
  const activeCount = useFiltersStore(selectActiveCount);

  const filters = { category, priceRanges, dietaryTags, minRating };
  const filtered = useMemo(
    () => applyFilters(MOCK_RESTAURANTS, { category, priceRanges, dietaryTags, minRating }),
    [category, priceRanges, dietaryTags, minRating],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Restaurantes</h1>
        <div className="w-full sm:max-w-sm">
          <SearchBar placeholder="Buscar..." />
        </div>
      </div>

      <div className="mb-8">
        <FilterBar
          filters={filters}
          activeCount={activeCount}
          onCategoryChange={setCategory}
          onTogglePrice={togglePrice}
          onToggleDietary={toggleDietary}
          onSetMinRating={setMinRating}
          onClearAll={clearAll}
          resultCount={filtered.length}
        />
      </div>

      <div className="mb-8">
        <QuickDecision restaurants={filtered} />
      </div>

      <RestaurantList restaurants={filtered} />
    </div>
  );
}
