"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "restaurapp-favorites";
const DEFAULT_FAVORITES = ["1", "2", "4"]; // La Trattoria di Napoli, Sakura Sushi, La Picá Chilena
const EMPTY: string[] = [];

let cachedSnapshot: string[] = EMPTY;

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: string[] = raw ? JSON.parse(raw) : DEFAULT_FAVORITES;
    if (
      parsed.length !== cachedSnapshot.length ||
      parsed.some((v, i) => v !== cachedSnapshot[i])
    ) {
      cachedSnapshot = parsed;
    }
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id) ? current.filter((fav) => fav !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  return { favorites, toggle, isFavorite };
}
