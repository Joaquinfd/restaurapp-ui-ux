"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User, UserPreferences } from "@/types";
import { MOCK_USER } from "@/lib/constants";

interface UserContextValue {
  user: User;
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  updatePreferences: (preferences: UserPreferences) => void;
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

  return (
    <UserContext.Provider value={{ user, toggleFavorite, isFavorite, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
