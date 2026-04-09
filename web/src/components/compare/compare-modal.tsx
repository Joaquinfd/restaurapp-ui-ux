"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompareModalProps {
  restaurants: Restaurant[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-CL")}`;
}

function avgMenuPrice(r: Restaurant) {
  if (r.menuItems.length === 0) return null;
  const avg = r.menuItems.reduce((s, i) => s + i.price, 0) / r.menuItems.length;
  return Math.round(avg);
}

export function CompareModal({ restaurants, onClose, onRemove }: CompareModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cols = restaurants.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        role="dialog"
        aria-label="Comparar restaurantes"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Comparar Restaurantes
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison grid */}
        <div className="p-5">
          <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
            {/* Restaurant names & remove */}
            {restaurants.map((r) => (
              <div key={r.id} className="text-center">
                <div className="mb-2 flex items-center justify-center gap-1">
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="text-base font-bold text-neutral-900 hover:text-blue-600 dark:text-white"
                  >
                    {r.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(r.id)}
                    className="ml-1 rounded p-0.5 text-neutral-400 hover:text-red-500"
                    aria-label={`Quitar ${r.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-neutral-500">{r.cuisine}</p>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          <div className="mt-6 space-y-0 divide-y divide-neutral-100 dark:divide-neutral-800">
            {/* Rating */}
            <CompareRow label="Rating" cols={cols}>
              {restaurants.map((r) => (
                <div key={r.id} className="flex justify-center">
                  <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />
                </div>
              ))}
            </CompareRow>

            {/* Price range */}
            <CompareRow label="Rango de precio" cols={cols}>
              {restaurants.map((r) => (
                <p key={r.id} className="text-center text-sm font-semibold text-neutral-900 dark:text-white">
                  {r.priceRange}
                </p>
              ))}
            </CompareRow>

            {/* Average dish price */}
            <CompareRow label="Precio promedio plato" cols={cols}>
              {restaurants.map((r) => {
                const avg = avgMenuPrice(r);
                return (
                  <p key={r.id} className="text-center text-sm text-neutral-700 dark:text-neutral-300">
                    {avg ? formatPrice(avg) : "—"}
                  </p>
                );
              })}
            </CompareRow>

            {/* Dietary options */}
            <CompareRow label="Opciones dietarias" cols={cols}>
              {restaurants.map((r) => (
                <div key={r.id} className="flex flex-wrap justify-center gap-1">
                  {r.dietaryTags.length > 0 ? (
                    r.dietaryTags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </div>
              ))}
            </CompareRow>

            {/* Opening hours */}
            <CompareRow label="Horario" cols={cols}>
              {restaurants.map((r) => (
                <p key={r.id} className="text-center text-sm text-neutral-700 dark:text-neutral-300">
                  {r.openingHours}
                </p>
              ))}
            </CompareRow>

            {/* Address */}
            <CompareRow label="Dirección" cols={cols}>
              {restaurants.map((r) => (
                <p key={r.id} className="text-center text-xs text-neutral-500">
                  {r.address}
                </p>
              ))}
            </CompareRow>

            {/* Tags */}
            <CompareRow label="Etiquetas" cols={cols}>
              {restaurants.map((r) => (
                <div key={r.id} className="flex flex-wrap justify-center gap-1">
                  {r.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                </div>
              ))}
            </CompareRow>

            {/* Top dishes */}
            <CompareRow label="Platos destacados" cols={cols}>
              {restaurants.map((r) => (
                <ul key={r.id} className="space-y-1 text-xs">
                  {r.menuItems.slice(0, 3).map((item) => (
                    <li key={item.name} className="flex items-start justify-between gap-1">
                      <span className="text-neutral-700 dark:text-neutral-300">{item.name}</span>
                      <span className="shrink-0 font-medium text-neutral-900 dark:text-white">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </CompareRow>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, cols, children }: { label: string; cols: number; children: React.ReactNode }) {
  return (
    <div className="py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </p>
      <div className={cn("grid gap-4", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {children}
      </div>
    </div>
  );
}
