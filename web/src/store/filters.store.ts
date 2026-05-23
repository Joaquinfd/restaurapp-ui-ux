import { create } from "zustand";

export interface Filters {
  category: string | null;
  priceRanges: string[];
  dietaryTags: string[];
  minRating: number | null;
}

interface FiltersState extends Filters {
  setCategory: (cat: string | null) => void;
  togglePrice: (price: string) => void;
  toggleDietary: (tag: string) => void;
  setMinRating: (rating: number | null) => void;
  clearAll: () => void;
}

const INITIAL: Filters = {
  category: null,
  priceRanges: [],
  dietaryTags: [],
  minRating: null,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  ...INITIAL,
  setCategory: (category) => set({ category }),
  togglePrice: (price) =>
    set((s) => ({
      priceRanges: s.priceRanges.includes(price)
        ? s.priceRanges.filter((p) => p !== price)
        : [...s.priceRanges, price],
    })),
  toggleDietary: (tag) =>
    set((s) => ({
      dietaryTags: s.dietaryTags.includes(tag)
        ? s.dietaryTags.filter((t) => t !== tag)
        : [...s.dietaryTags, tag],
    })),
  setMinRating: (rating) =>
    set((s) => ({ minRating: s.minRating === rating ? null : rating })),
  clearAll: () => set(INITIAL),
}));

export const selectActiveCount = (s: FiltersState) =>
  (s.category ? 1 : 0) + s.priceRanges.length + s.dietaryTags.length + (s.minRating ? 1 : 0);
