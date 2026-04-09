"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Restaurant } from "@/types";

const MAX_COMPARE = 3;

interface CompareContextValue {
  items: Restaurant[];
  isSelected: (id: string) => boolean;
  toggle: (restaurant: Restaurant) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue>({
  items: [],
  isSelected: () => false,
  toggle: () => {},
  remove: () => {},
  clearAll: () => {},
  isFull: false,
});

export function useCompare() {
  return useContext(CompareContext);
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Restaurant[]>([]);

  const isSelected = useCallback((id: string) => items.some((r) => r.id === id), [items]);

  const toggle = useCallback((restaurant: Restaurant) => {
    setItems((prev) => {
      if (prev.some((r) => r.id === restaurant.id)) {
        return prev.filter((r) => r.id !== restaurant.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, restaurant];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, isSelected, toggle, remove, clearAll, isFull: items.length >= MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}
