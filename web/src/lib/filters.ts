import type { Restaurant } from "@/types";
import type { Filters } from "@/store/filters.store";
import { CATEGORIES } from "@/lib/constants";

export function applyFilters(restaurants: Restaurant[], filters: Partial<Filters>): Restaurant[] {
  const { category = null, priceRanges = [], dietaryTags = [], minRating = null } = filters;
  return restaurants.filter((r) => {
    if (category) {
      const cat = CATEGORIES.find((c) => c.slug === category);
      if (cat && r.cuisine !== cat.name) return false;
    }
    if (priceRanges.length > 0 && !priceRanges.includes(r.priceRange)) return false;
    if (dietaryTags.length > 0 && !dietaryTags.every((t) => r.dietaryTags.includes(t))) return false;
    if (minRating !== null && r.rating < minRating) return false;
    return true;
  });
}
