"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  loadLastSearch,
  clearLastSearch,
  timeAgo,
  type SearchSnapshot,
} from "@/lib/search-history";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Restaurant } from "@/types";

const PREVIEW_COUNT = 4;

/** Stable no-op subscriber for the hydration-flag useSyncExternalStore. */
const subscribeNoop = () => () => {};

export function LastSearch() {
  // `isLoaded` flips true after hydration, so we read the persisted search from
  // localStorage during render (useMemo) instead of effect + setState.
  const isLoaded = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const restaurants = useRestaurantsStore((s) => s.restaurants);

  const snapshot = useMemo<SearchSnapshot | null>(
    () => (isLoaded && !dismissed ? loadLastSearch() : null),
    [isLoaded, dismissed],
  );

  if (!snapshot) return null;

  const filters = [
    ...snapshot.cuisines,
    ...snapshot.prices,
    ...snapshot.vibes,
    ...snapshot.dietary,
  ];

  const matched = snapshot.resultIds
    .map((id) => restaurants.find((r) => r.id === id))
    .filter((r): r is Restaurant => r !== undefined);

  const visible = expanded ? matched : matched.slice(0, PREVIEW_COUNT);
  const hidden = matched.length - PREVIEW_COUNT;

  function dismiss() {
    clearLastSearch();
    setDismissed(true);
  }

  return (
    <Card className="mb-8">
      <CardHeader className="border-b">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="flex items-center gap-2">🕐 Última búsqueda</CardTitle>
          <CardDescription>
            {timeAgo(snapshot.timestamp)} · {matched.length} restaurante
            {matched.length !== 1 && "s"}
          </CardDescription>
        </div>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            aria-label="Cerrar última búsqueda"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <Badge key={f} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
        )}

        {matched.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hubo resultados para esos filtros.</p>
        ) : (
          <>
            <RestaurantList restaurants={visible} />
            {!expanded && hidden > 0 && (
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
                  Ver {hidden} restaurante{hidden !== 1 && "s"} más
                </Button>
              </div>
            )}
            {expanded && matched.length > PREVIEW_COUNT && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
                  Mostrar menos
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
