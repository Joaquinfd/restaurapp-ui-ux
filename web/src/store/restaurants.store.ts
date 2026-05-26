import { create } from "zustand";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import type { Restaurant } from "@/types";

interface RestaurantsStore {
  restaurants: Restaurant[];
  updateRestaurant: (id: string, patch: Partial<Omit<Restaurant, "id">>) => void;
  addRestaurant: (restaurant: Restaurant) => void;
  removeRestaurant: (id: string) => void;
}

export const useRestaurantsStore = create<RestaurantsStore>((set) => ({
  restaurants: MOCK_RESTAURANTS,

  updateRestaurant: (id, patch) =>
    set((s) => ({
      restaurants: s.restaurants.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  addRestaurant: (restaurant) =>
    set((s) => ({ restaurants: [...s.restaurants, restaurant] })),

  removeRestaurant: (id) =>
    set((s) => ({ restaurants: s.restaurants.filter((r) => r.id !== id) })),
}));
