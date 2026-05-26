"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
function FlyToSelected({
  places,
  selectedId,
}: {
  places: Array<Pick<Restaurant, "id" | "lat" | "lng">>;
  selectedId: string | null;
}) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId && selectedId !== prevId.current) {
      const r = places.find((r) => r.id === selectedId);
      if (r) map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
    }
    prevId.current = selectedId;
  }, [selectedId, places, map]);

  return null;
}

function LocateUserControl({
  onUserLocation,
}: {
  onUserLocation?: (coords: { lat: number; lng: number }) => void;
}) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizacion no disponible en este navegador.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUserLocation?.({ lat: latitude, lng: longitude });
        map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), { duration: 0.8 });
        setIsLocating(false);
      },
      () => {
        setError("No se pudo obtener tu ubicacion.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="pointer-events-none absolute top-3 right-3 z-[1000]">
      <button
        type="button"
        onClick={locateUser}
        disabled={isLocating}
        className="pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-md ring-1 ring-black/5 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <span aria-hidden="true">📍</span>
        {isLocating ? "Ubicando..." : "Mi ubicacion"}
      </button>
      {error && (
        <p className="mt-1 max-w-[220px] rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700 shadow-sm dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onUserLocation?: (coords: { lat: number; lng: number }) => void;
}

export function RestaurantMap({
  restaurants,
  center = [-33.4372, -70.6506],
  zoom = 13,
  selectedId,
  onMarkerClick,
  onUserLocation,
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
      <LocateUserControl onUserLocation={onUserLocation} />
      <FlyToSelected places={restaurants} selectedId={selectedId ?? null} />
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
              <p className="mt-0.5 text-xs text-neutral-500">
                {r.cuisine} · {r.priceRange}
              </p>
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
