"use client";

import type { Restaurant } from "@/types";
import { MapWrapper } from "@/components/map/map-wrapper";
import Link from "next/link";

interface DetailMapAndMenuProps {
  restaurant: Restaurant;
}

export function DetailMapAndMenu({ restaurant }: DetailMapAndMenuProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">📍 Ubicación</h3>
      </div>
      <div className="h-48 isolate">
        <MapWrapper
          restaurants={[restaurant]}
          selectedId={restaurant.id}
        />
      </div>
      <div className="p-4 pt-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{restaurant.address}</p>
        <Link
          href={`/map?selected=${restaurant.id}`}
          className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Ver en mapa completo →
        </Link>
      </div>
    </div>
  );
}
