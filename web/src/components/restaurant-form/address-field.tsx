"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AddressPreviewMap = dynamic(
  () => import("@/components/map/address-preview-map").then((m) => m.AddressPreviewMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <p className="text-xs text-neutral-400">Cargando mapa…</p>
      </div>
    ),
  },
);

type PreviewStatus = "idle" | "loading" | "found" | "not-found";

export interface GeoPreview {
  lat: number;
  lng: number;
  label: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const FALLBACK_COORDS = { lat: -33.4489, lng: -70.6693 };

export async function fetchCoords(query: string): Promise<GeoPreview | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "es", "User-Agent": "RestaurApp/1.0" } },
    );
    const data: NominatimResult[] = await res.json();
    if (!data[0]) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      label: data[0].display_name,
    };
  } catch {
    return null;
  }
}

export interface AddressFieldProps {
  value: string;
  onChange: (v: string) => void;
  onGeoChange?: (geo: GeoPreview | null) => void;
  initialGeo?: GeoPreview;
  required?: boolean;
}

export function AddressField({ value, onChange, onGeoChange, initialGeo, required }: AddressFieldProps) {
  const [preview, setPreview] = useState<GeoPreview | null>(initialGeo ?? null);
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>(initialGeo ? "found" : "idle");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestMounted = useRef(false);
  const previewMounted = useRef(false);
  const pickedFromSuggestion = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Suggestions — 300 ms debounce, skip first render
  useEffect(() => {
    if (!suggestMounted.current) { suggestMounted.current = true; return; }
    const trimmed = value.trim();
    if (trimmed.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5`,
          { headers: { "Accept-Language": "es", "User-Agent": "RestaurApp/1.0" } },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setHighlightedIndex(-1);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Map preview — 600 ms debounce, skip first render
  useEffect(() => {
    if (!previewMounted.current) { previewMounted.current = true; return; }
    if (pickedFromSuggestion.current) { pickedFromSuggestion.current = false; return; }
    const trimmed = value.trim();
    if (trimmed.length < 5) return;
    setPreviewStatus("loading");
    const timer = setTimeout(async () => {
      const result = await fetchCoords(trimmed);
      if (result) {
        setPreview(result);
        setPreviewStatus("found");
        onGeoChange?.(result);
      } else {
        setPreview(null);
        setPreviewStatus("not-found");
        onGeoChange?.(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectSuggestion = (s: NominatimResult) => {
    pickedFromSuggestion.current = true;
    onChange(s.display_name);
    const geo = { lat: parseFloat(s.lat), lng: parseFloat(s.lon), label: s.display_name };
    setPreview(geo);
    setPreviewStatus("found");
    onGeoChange?.(geo);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); selectSuggestion(suggestions[highlightedIndex]); }
    else if (e.key === "Escape") { setShowSuggestions(false); setHighlightedIndex(-1); }
  };

  return (
    <div>
      <div ref={containerRef} className="relative">
        <Input
          required={required}
          type="text"
          value={value}
          onChange={(e) => {
            const nextValue = e.target.value;
            onChange(nextValue);
            const trimmed = nextValue.trim();
            if (trimmed.length < 3) {
              setSuggestions([]);
              setShowSuggestions(false);
              setHighlightedIndex(-1);
              setPreview(null);
              setPreviewStatus("idle");
              onGeoChange?.(null);
              return;
            }
            if (trimmed.length < 5) {
              setPreview(null);
              setPreviewStatus("idle");
              onGeoChange?.(null);
            }
            setShowSuggestions(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ej. Av. Providencia 1234, Santiago"
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border shadow-lg">
            {suggestions.map((s, i) => {
              const parts = s.display_name.split(", ");
              const main = parts[0];
              const sub = parts.slice(1, 3).join(", ");
              return (
                <button
                  key={s.place_id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                  className={cn(
                    "hover:bg-accent flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors",
                    i === highlightedIndex && "bg-accent",
                    i > 0 && "border-border border-t",
                  )}
                >
                  <span className="text-foreground truncate text-sm font-medium">{main}</span>
                  {sub && <span className="text-muted-foreground truncate text-xs">{sub}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!showSuggestions && previewStatus === "idle" && (
        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
          <span>🗺️</span>
          Se mostrará la ubicación en el mapa al escribir la dirección.
        </p>
      )}
      {!showSuggestions && previewStatus === "loading" && (
        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Buscando ubicación…
        </p>
      )}
      {!showSuggestions && previewStatus === "not-found" && (
        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
          ⚠ No se encontró esta dirección. Verifica el texto o intenta con más detalle.
        </p>
      )}
      {!showSuggestions && previewStatus === "found" && preview && (
        <div className="border-border mt-2 overflow-hidden rounded-xl border">
          <div className="h-48">
            <AddressPreviewMap lat={preview.lat} lng={preview.lng} />
          </div>
          <div className="border-border flex items-start gap-2 border-t bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900">
            <span className="mt-px shrink-0 text-sm">📍</span>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{preview.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
