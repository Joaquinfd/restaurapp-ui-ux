"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User, UserPreferences } from "@/types";
import { MOCK_USER } from "@/lib/constants";

interface UserContextValue {
  user: User;
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  updatePreferences: (preferences: UserPreferences) => void;
  addOwnedRestaurant: (restaurantId: string) => void;
  removeOwnedRestaurant: (restaurantId: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);

  const toggleFavorite = useCallback((restaurantId: string) => {
    setUser((u) => ({
      ...u,
      favorites: u.favorites.includes(restaurantId)
        ? u.favorites.filter((id) => id !== restaurantId)
        : [...u.favorites, restaurantId],
    }));
  }, []);

  const isFavorite = useCallback(
    (restaurantId: string) => user.favorites.includes(restaurantId),
    [user.favorites],
  );

  const updatePreferences = useCallback((preferences: UserPreferences) => {
    setUser((u) => ({ ...u, preferences }));
  }, []);

  const addOwnedRestaurant = useCallback((restaurantId: string) => {
    setUser((u) => ({
      ...u,
      role: "OWNER",
      ownedRestaurants: u.ownedRestaurants.includes(restaurantId)
        ? u.ownedRestaurants
        : [...u.ownedRestaurants, restaurantId],
    }));
  }, []);

  const removeOwnedRestaurant = useCallback((restaurantId: string) => {
    setUser((u) => {
      const next = u.ownedRestaurants.filter((id) => id !== restaurantId);
      return { ...u, ownedRestaurants: next, role: next.length === 0 ? "DINER" : u.role };
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, toggleFavorite, isFavorite, updatePreferences, addOwnedRestaurant, removeOwnedRestaurant }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
