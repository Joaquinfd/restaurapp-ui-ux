"use client";

import { useState, useMemo, useCallback } from "react";
import type { Restaurant } from "@/types";
import { CATEGORIES } from "@/lib/constants";

export interface Filters {
  category: string | null;
  priceRanges: string[];
  dietaryTags: string[];
  minRating: number | null;
}

const INITIAL_FILTERS: Filters = {
  category: null,
  priceRanges: [],
  dietaryTags: [],
  minRating: null,
};

export function useRestaurantFilters(restaurants: Restaurant[]) {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const setCategory = useCallback((cat: string | null) => {
    setFilters((f) => ({ ...f, category: cat }));
  }, []);

  const togglePrice = useCallback((price: string) => {
    setFilters((f) => ({
      ...f,
      priceRanges: f.priceRanges.includes(price)
        ? f.priceRanges.filter((p) => p !== price)
        : [...f.priceRanges, price],
    }));
  }, []);

  const toggleDietary = useCallback((tag: string) => {
    setFilters((f) => ({
      ...f,
      dietaryTags: f.dietaryTags.includes(tag)
        ? f.dietaryTags.filter((t) => t !== tag)
        : [...f.dietaryTags, tag],
    }));
  }, []);

  const setMinRating = useCallback((rating: number | null) => {
    setFilters((f) => ({ ...f, minRating: f.minRating === rating ? null : rating }));
  }, []);

  const clearAll = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const activeCount =
    (filters.category ? 1 : 0) +
    filters.priceRanges.length +
    filters.dietaryTags.length +
    (filters.minRating ? 1 : 0);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (filters.category) {
        const cat = CATEGORIES.find((c) => c.slug === filters.category);
        if (cat && r.cuisine !== cat.name) return false;
      }
      if (filters.priceRanges.length > 0 && !filters.priceRanges.includes(r.priceRange)) return false;
      if (filters.dietaryTags.length > 0 && !filters.dietaryTags.every((t) => r.dietaryTags.includes(t))) return false;
      if (filters.minRating && r.rating < filters.minRating) return false;
      return true;
    });
  }, [restaurants, filters]);

  return {
    filters,
    filtered,
    activeCount,
    setCategory,
    togglePrice,
    toggleDietary,
    setMinRating,
    clearAll,
  };
}
