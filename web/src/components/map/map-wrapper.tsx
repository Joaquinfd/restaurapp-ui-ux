"use client";

import dynamic from "next/dynamic";
import type { Restaurant } from "@/types";

const RestaurantMap = dynamic(() => import("./restaurant-map").then((mod) => mod.RestaurantMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
      <p className="text-sm text-neutral-500">Cargando mapa…</p>
    </div>
  ),
});

interface MapWrapperProps {
  restaurants: Restaurant[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onUserLocation?: (coords: { lat: number; lng: number }) => void;
}

export function MapWrapper({
  restaurants,
  selectedId,
  onMarkerClick,
  onUserLocation,
}: MapWrapperProps) {
  return (
    <RestaurantMap
      restaurants={restaurants}
      selectedId={selectedId}
      onMarkerClick={onMarkerClick}
      onUserLocation={onUserLocation}
    />
  );
}
