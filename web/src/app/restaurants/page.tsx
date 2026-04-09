"use client";

import { MOCK_RESTAURANTS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { useRestaurantFilters } from "@/hooks/use-restaurant-filters";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { QuickDecision } from "@/components/restaurants/quick-decision";
import { SearchBar } from "@/components/search/search-bar";

export default function RestaurantsPage() {
  const {
    filters,
    filtered,
    activeCount,
    setCategory,
    togglePrice,
    toggleDietary,
    setMinRating,
    clearAll,
  } = useRestaurantFilters(MOCK_RESTAURANTS);

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
