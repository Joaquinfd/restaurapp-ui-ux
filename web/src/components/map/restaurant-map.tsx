"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";

// Fix default marker icons broken by bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
});

L.Marker.prototype.options.icon = defaultIcon;

/** Flies the map to a restaurant when selectedId changes */
function FlyToSelected({ restaurants, selectedId }: { restaurants: Restaurant[]; selectedId: string | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId && selectedId !== prevId.current) {
      const r = restaurants.find((r) => r.id === selectedId);
      if (r) map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
    }
    prevId.current = selectedId;
  }, [selectedId, restaurants, map]);

  return null;
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

export function RestaurantMap({
  restaurants,
  center = [-33.4372, -70.6506],
  zoom = 13,
  selectedId,
  onMarkerClick,
}: RestaurantMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected restaurants={restaurants} selectedId={selectedId ?? null} />
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={selectedId === r.id ? activeIcon : defaultIcon}
          opacity={selectedId && selectedId !== r.id ? 0.5 : 1}
          eventHandlers={{
            click: () => onMarkerClick?.(r.id),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <Link
                href={`/restaurants/${r.id}`}
                className="text-base font-semibold text-neutral-900 hover:text-blue-600 dark:text-white"
              >
                {r.name}
              </Link>
              <p className="mt-0.5 text-xs text-neutral-500">{r.cuisine} · {r.priceRange}</p>
              <div className="mt-1">
                <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />
              </div>
              <p className="mt-1 text-xs text-neutral-500">{r.address}</p>
              <p className="text-xs text-neutral-400">{r.openingHours}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
