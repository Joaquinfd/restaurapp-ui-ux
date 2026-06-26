"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

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

const ROWS: { label: string; render: (r: Restaurant) => ReactNode }[] = [
  {
    label: "Rating",
    render: (r) => (
      <div className="flex justify-center">
        <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />
      </div>
    ),
  },
  {
    label: "Rango de precio",
    render: (r) => (
      <p className="text-center text-sm font-semibold text-neutral-900 dark:text-white">
        {r.priceRange}
      </p>
    ),
  },
  {
    label: "Precio promedio plato",
    render: (r) => {
      const avg = avgMenuPrice(r);
      return (
        <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
          {avg ? formatPrice(avg) : "—"}
        </p>
      );
    },
  },
  {
    label: "Opciones dietarias",
    render: (r) => (
      <div className="flex flex-wrap justify-center gap-1">
        {r.dietaryTags.length > 0 ? (
          r.dietaryTags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        )}
      </div>
    ),
  },
  {
    label: "Horario",
    render: (r) => (
      <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">{r.openingHours}</p>
    ),
  },
  {
    label: "Dirección",
    render: (r) => <p className="text-center text-xs text-neutral-500">{r.address}</p>,
  },
  {
    label: "Etiquetas",
    render: (r) => (
      <div className="flex flex-wrap justify-center gap-1">
        {r.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    ),
  },
  {
    label: "Platos destacados",
    render: (r) => (
      <ul className="space-y-1 text-xs">
        {r.menuItems.slice(0, 3).map((item) => (
          <li key={item.name} className="flex items-start justify-between gap-1">
            <span className="text-neutral-700 dark:text-neutral-300">{item.name}</span>
            <span className="shrink-0 font-medium text-neutral-900 dark:text-white">
              {formatPrice(item.price)}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
];

export function CompareModal({ restaurants, onClose, onRemove }: CompareModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cols = restaurants.length;
  // One label column + one column per restaurant. The restaurant columns have a
  // min width, so on a narrow phone the table overflows its container and scrolls
  // horizontally (the label column stays pinned) instead of crushing 3 columns
  // into ~100px each. On desktop the `1fr` columns expand to fill the modal.
  const gridTemplateColumns = `minmax(6.5rem, max-content) repeat(${cols}, minmax(8.5rem, 1fr))`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        role="dialog"
        aria-label="Comparar restaurantes"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Comparar Restaurantes
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
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

        {/* Comparison table — scrolls vertically and (on mobile) horizontally */}
        <div className="overflow-auto">
          <div className="grid items-start gap-x-3 p-5" style={{ gridTemplateColumns }}>
            {/* Header row: empty corner + restaurant names */}
            <div />
            {restaurants.map((r) => (
              <div key={r.id} className="pb-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Link
                    href={`/restaurants/${r.id}`}
                    className="text-base font-bold text-neutral-900 hover:text-blue-600 dark:text-white"
                  >
                    {r.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onRemove(r.id)}
                    className="rounded p-0.5 text-neutral-400 hover:text-red-500"
                    aria-label={`Quitar ${r.name}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-neutral-500">{r.cuisine}</p>
              </div>
            ))}

            {/* Attribute rows */}
            {ROWS.map((row) => (
              <div key={row.label} className="contents">
                <div className="border-t border-neutral-100 py-3 pr-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase dark:border-neutral-800 dark:text-neutral-500">
                  {row.label}
                </div>
                {restaurants.map((r) => (
                  <div
                    key={r.id}
                    className="border-t border-neutral-100 py-3 dark:border-neutral-800"
                  >
                    {row.render(r)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
