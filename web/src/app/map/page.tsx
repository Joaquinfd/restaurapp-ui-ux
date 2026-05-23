"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { MapWrapper } from "@/components/map/map-wrapper";
import { FilterBar } from "@/components/filters/filter-bar";
import { useFiltersStore, selectActiveCount } from "@/store/filters.store";
import { applyFilters } from "@/lib/filters";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Restaurant } from "@/types";

type MapListRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  address: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  lat: number;
  lng: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export default function MapPage() {
  const { category, priceRanges, dietaryTags, minRating, setCategory, togglePrice, toggleDietary, setMinRating, clearAll } =
    useFiltersStore(useShallow((s) => s));
  const activeCount = useFiltersStore(selectActiveCount);

  const filters = { category, priceRanges, dietaryTags, minRating };
  const restaurants = useMemo(
    () => applyFilters(MOCK_RESTAURANTS, { category, priceRanges, dietaryTags, minRating }),
    [category, priceRanges, dietaryTags, minRating],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const restaurantsByProximity = useMemo(() => {
    if (!userLocation) return restaurants;
    return [...restaurants].sort((a, b) => {
      const distanceA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distanceB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distanceA - distanceB;
    });
  }, [restaurants, userLocation]);

  const listItems = useMemo<MapListRestaurant[]>(() => {
    const appItems = restaurantsByProximity.map<MapListRestaurant>((r: Restaurant) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      address: r.address,
      tags: r.tags,
      rating: r.rating,
      reviewCount: r.reviewCount,
      lat: r.lat,
      lng: r.lng,
    }));
    return appItems;
  }, [restaurantsByProximity]);

  // Auto-scroll sidebar card into view when selected
  useEffect(() => {
    if (!selectedId) return;
    const el = cardRefs.current.get(selectedId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:h-screen">
      {/* Top filter bar */}
      <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
          Mapa de Restaurantes
        </h1>
        <FilterBar
          filters={filters}
          activeCount={activeCount}
          onCategoryChange={setCategory}
          onTogglePrice={togglePrice}
          onToggleDietary={toggleDietary}
          onSetMinRating={setMinRating}
          onClearAll={clearAll}
          resultCount={listItems.length}
        />
      </div>

      {/* Map + sidebar list */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop: Restaurant card panel */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-950">
          <div className="space-y-2 p-3">
            {listItems.map((r) => (
              <div
                key={r.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(r.id, el);
                }}
                onClick={() => handleSelect(r.id)}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 transition-all",
                  selectedId === r.id
                    ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-950/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/restaurants/${r.id}`}
                      className="font-semibold text-neutral-900 hover:text-blue-600 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {r.cuisine} · {r.priceRange}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xl">🍽️</span>
                </div>
                {r.rating !== undefined && (
                  <div className="mt-1.5">
                    <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />
                  </div>
                )}
                <p className="mt-1.5 text-xs text-neutral-400">{r.address}</p>
                {r.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {listItems.length === 0 && (
              <p className="py-8 text-center text-sm text-neutral-500">
                No se encontraron restaurantes en esta categoría.
              </p>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1">
          <MapWrapper
            restaurants={restaurantsByProximity}
            selectedId={selectedId}
            onMarkerClick={handleSelect}
            onUserLocation={setUserLocation}
          />
        </div>

        {/* Mobile: Horizontal scrollable card strip */}
        <div
          ref={mobileScrollRef}
          className="absolute right-0 bottom-0 left-0 flex gap-3 overflow-x-auto px-3 pt-1 pb-4 md:hidden"
        >
          {listItems.map((r) => (
            <div
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className={cn(
                "w-64 shrink-0 cursor-pointer rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all",
                selectedId === r.id
                  ? "border-blue-500 bg-blue-50/95 dark:border-blue-400 dark:bg-blue-950/80"
                  : "border-neutral-200 bg-white/95 dark:border-neutral-700 dark:bg-neutral-900/95",
              )}
            >
              <span className="font-semibold text-neutral-900 dark:text-white">{r.name}</span>
              <p className="mt-0.5 text-xs text-neutral-500">
                {r.cuisine} · {r.priceRange}
              </p>
              {r.rating !== undefined && (
                <div className="mt-1">
                  <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />
                </div>
              )}
              <p className="mt-1 truncate text-xs text-neutral-400">{r.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
