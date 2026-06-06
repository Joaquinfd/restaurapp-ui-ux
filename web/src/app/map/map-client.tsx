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

export default function MapClient() {
  const {
    category,
    priceRanges,
    dietaryTags,
    minRating,
    setCategory,
    togglePrice,
    toggleDietary,
    setMinRating,
    clearAll,
  } = useFiltersStore(useShallow((s) => s));
  const activeCount = useFiltersStore(selectActiveCount);

  const filters = { category, priceRanges, dietaryTags, minRating };
  const restaurants = useMemo(
    () => applyFilters(MOCK_RESTAURANTS, { category, priceRanges, dietaryTags, minRating }),
    [category, priceRanges, dietaryTags, minRating],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

        {/* Map — isolate creates a stacking context so Leaflet z-indexes don't escape */}
        <div className="flex-1 isolate">
          <MapWrapper
            restaurants={restaurantsByProximity}
            selectedId={selectedId}
            onMarkerClick={handleSelect}
            onUserLocation={setUserLocation}
          />
        </div>

        {/* Mobile: bottom sheet trigger pill */}
        {!sheetOpen && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="absolute bottom-4 left-1/2 z-500 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg md:hidden dark:bg-white dark:text-neutral-900"
          >
            <span>Ver {listItems.length} restaurantes</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Mobile: bottom sheet */}
        {sheetOpen && (
          <div className="absolute inset-x-0 bottom-0 z-500 flex max-h-[65vh] flex-col rounded-t-2xl bg-white shadow-2xl md:hidden dark:bg-neutral-950">
            {/* Drag handle */}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="flex w-full flex-col items-center pt-3 pb-1"
              aria-label="Cerrar lista"
            >
              <div className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </button>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-4 pb-3">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                {listItems.length} restaurantes
              </span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Scrollable list */}
            <div className="space-y-2 overflow-y-auto px-3 pb-6">
              {listItems.map((r) => (
                <div
                  key={r.id}
                  onClick={() => { handleSelect(r.id); setSheetOpen(false); }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-all",
                    selectedId === r.id
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
                      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900",
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
                  <p className="mt-1.5 truncate text-xs text-neutral-400">{r.address}</p>
                  {r.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
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
          </div>
        )}
      </div>
    </div>
  );
}
