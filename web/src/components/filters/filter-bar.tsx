"use client";

import { cn } from "@/lib/utils";
import { PRICE_OPTIONS, DIETARY_OPTIONS, RATING_OPTIONS } from "@/lib/constants";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import type { Filters } from "@/hooks/use-restaurant-filters";

interface FilterBarProps {
  filters: Filters;
  activeCount: number;
  onCategoryChange: (slug: string | null) => void;
  onTogglePrice: (price: string) => void;
  onToggleDietary: (tag: string) => void;
  onSetMinRating: (rating: number | null) => void;
  onClearAll: () => void;
  resultCount: number;
}

export function FilterBar({
  filters,
  activeCount,
  onCategoryChange,
  onTogglePrice,
  onToggleDietary,
  onSetMinRating,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category row */}
      <CategoryFilter selected={filters.category} onSelect={onCategoryChange} />

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Price filters */}
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Precio:</span>
        {PRICE_OPTIONS.map((price) => (
          <button
            key={price}
            type="button"
            onClick={() => onTogglePrice(price)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filters.priceRanges.includes(price)
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            )}
          >
            {price}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Rating filters */}
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Rating:</span>
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSetMinRating(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filters.minRating === opt.value
                ? "bg-yellow-400 text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            )}
          >
            ★ {opt.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Dietary filters */}
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Dieta:</span>
        {DIETARY_OPTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleDietary(tag)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              filters.dietaryTags.includes(tag)
                ? "bg-green-600 text-white dark:bg-green-500 dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Active filters summary */}
      {activeCount > 0 && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400">
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Limpiar filtros ({activeCount})
          </button>
        </div>
      )}
    </div>
  );
}
