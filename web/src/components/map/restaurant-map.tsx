"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ExternalRestaurant, Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { fetchNearbyOsmRestaurants } from "@/lib/osm-restaurants";

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

const osmIcon = L.divIcon({
  html: '<span style="display:inline-flex;align-items:center;justify-content:center;width:7px;height:7px;border-radius:9999px;background:red;border:2px solid #475569;box-shadow:0 1px 5px rgba(0,0,0,.24)"></span>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

L.Marker.prototype.options.icon = defaultIcon;

/** Flies the map to a restaurant when selectedId changes */
function FlyToSelected({
  places,
  selectedId,
}: {
  places: Array<
    Pick<Restaurant, "id" | "lat" | "lng"> | Pick<ExternalRestaurant, "id" | "lat" | "lng">
  >;
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
    <div className="pointer-events-none absolute right-3 top-3 z-[1000]">
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

function OsmRestaurantsOverlay({
  selectedId,
  onMarkerClick,
  onExternalRestaurantsChange,
}: {
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onExternalRestaurantsChange?: (restaurants: ExternalRestaurant[]) => void;
}) {
  const map = useMap();
  const [osmRestaurants, setOsmRestaurants] = useState<ExternalRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNearbyRestaurants = async () => {
    const center = map.getCenter();
    setLoading(true);
    setError(null);

    try {
      const parsed = await fetchNearbyOsmRestaurants(center.lat, center.lng);

      setOsmRestaurants(parsed);
      onExternalRestaurantsChange?.(parsed);
    } catch {
      setError("No se pudieron cargar restaurantes desde OpenStreetMap.");
      onExternalRestaurantsChange?.([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearbyRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="pointer-events-none absolute right-3 top-14 z-[1000]">
        <button
          type="button"
          onClick={loadNearbyRestaurants}
          disabled={loading}
          className="pointer-events-auto inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-md ring-1 ring-black/5 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <span aria-hidden="true">○</span>
          {loading ? "Buscando..." : "Fuentes externas"}
        </button>
        {error && (
          <p className="mt-1 max-w-[220px] rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-700 shadow-sm dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
      </div>

      <LayersControl.Overlay checked name={`OpenStreetMap externo (${osmRestaurants.length})`}>
        <LayerGroup>
          {osmRestaurants.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={osmIcon}
              opacity={selectedId && selectedId !== r.id ? 0.5 : 1}
              eventHandlers={{
                click: () => {
                  console.log("OSM restaurant", r);
                },
              }}
            >
              <Popup>
                <div className="min-w-[190px]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Fuente externa (OSM)
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">{r.name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      </LayersControl.Overlay>
    </>
  );
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onUserLocation?: (coords: { lat: number; lng: number }) => void;
  onExternalRestaurantsChange?: (restaurants: ExternalRestaurant[]) => void;
}

export function RestaurantMap({
  restaurants,
  center = [-33.4372, -70.6506],
  zoom = 13,
  selectedId,
  onMarkerClick,
  onUserLocation,
  onExternalRestaurantsChange,
}: RestaurantMapProps) {
  const [externalRestaurants, setExternalRestaurants] = useState<ExternalRestaurant[]>([]);
  const allPlaces = [...restaurants, ...externalRestaurants];

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
      <FlyToSelected places={allPlaces} selectedId={selectedId ?? null} />
      <LayersControl position="topleft">
        <LayersControl.Overlay checked name={`RestaurApp (${restaurants.length})`}>
          <LayerGroup>
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
          </LayerGroup>
        </LayersControl.Overlay>
        <OsmRestaurantsOverlay
          selectedId={selectedId}
          onMarkerClick={onMarkerClick}
          onExternalRestaurantsChange={(items) => {
            setExternalRestaurants(items);
            onExternalRestaurantsChange?.(items);
          }}
        />
      </LayersControl>
    </MapContainer>
  );
}
