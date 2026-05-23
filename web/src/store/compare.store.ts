import { create } from "zustand";
import type { Restaurant } from "@/types";

const MAX_COMPARE = 3;

interface CompareState {
  items: Restaurant[];
  isFull: boolean;
  isSelected: (id: string) => boolean;
  toggle: (restaurant: Restaurant) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  items: [],
  isFull: false,
  isSelected: (id) => get().items.some((r) => r.id === id),
  toggle: (restaurant) =>
    set((s) => {
      if (s.items.some((r) => r.id === restaurant.id)) {
        const items = s.items.filter((r) => r.id !== restaurant.id);
        return { items, isFull: items.length >= MAX_COMPARE };
      }
      if (s.items.length >= MAX_COMPARE) return s;
      const items = [...s.items, restaurant];
      return { items, isFull: items.length >= MAX_COMPARE };
    }),
  remove: (id) =>
    set((s) => {
      const items = s.items.filter((r) => r.id !== id);
      return { items, isFull: items.length >= MAX_COMPARE };
    }),
  clearAll: () => set({ items: [], isFull: false }),
}));
