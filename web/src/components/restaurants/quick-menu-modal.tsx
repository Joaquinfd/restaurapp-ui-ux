"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";

interface QuickMenuModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

function formatPrice(price: number) {
  return `$${price.toLocaleString("es-CL")}`;
}

export function QuickMenuModal({ restaurant, onClose }: QuickMenuModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        role="dialog"
        aria-label={`Menú de ${restaurant.name}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {restaurant.name}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {restaurant.cuisine} · {restaurant.priceRange}
            </p>
            <div className="mt-1">
              <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} size="sm" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Cerrar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
            Platos destacados
          </h3>
          <ul className="space-y-3">
            {restaurant.menuItems.map((item) => (
              <li
                key={item.name}
                className="flex items-start justify-between gap-3 rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(item.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-700">
          <Link
            href={`/restaurants/${restaurant.id}`}
            className="block w-full rounded-lg bg-neutral-900 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Ver restaurante completo →
          </Link>
        </div>
      </div>
    </div>
  );
}
