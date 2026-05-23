"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { getSocialTags } from "@/lib/social-tags";
import { cn } from "@/lib/utils";
import { getCuisineImage } from "@/lib/cuisine-images";

const TAG_COLORS = {
  yellow: "bg-yellow-400/90 text-yellow-900",
  blue: "bg-blue-500/90 text-white",
  green: "bg-green-500/90 text-white",
  purple: "bg-purple-500/90 text-white",
} as const;

function pickWeightedRandom(restaurants: Restaurant[], exclude?: string): Restaurant {
  // Weight by rating so higher rated restaurants are more likely
  const pool = exclude ? restaurants.filter((r) => r.id !== exclude) : restaurants;
  const list = pool.length > 0 ? pool : restaurants;
  const weights = list.map((r) => r.rating * r.rating);
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < list.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return list[i];
  }
  return list[list.length - 1];
}

interface QuickDecisionProps {
  restaurants: Restaurant[];
}

export function QuickDecision({ restaurants }: QuickDecisionProps) {
  const [result, setResult] = useState<Restaurant | null>(null);
  const [spinning, setSpinning] = useState(false);

  const decide = useCallback(() => {
    if (restaurants.length === 0) return;
    setSpinning(true);
    // Brief animation delay
    setTimeout(() => {
      setResult(pickWeightedRandom(restaurants, result?.id));
      setSpinning(false);
    }, 600);
  }, [restaurants, result?.id]);

  if (restaurants.length === 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
      {!result ? (
        <>
          <p className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white">
            ¿No sabes qué elegir?
          </p>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            Deja que te sugiramos un restaurante basado en tus filtros.
          </p>
          <button
            type="button"
            onClick={decide}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
            </svg>
            Decidir por mí
          </button>
        </>
      ) : (
        <div className={cn("transition-opacity duration-300", spinning ? "opacity-30" : "opacity-100")}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            🎯 Nuestra sugerencia para ti
          </p>

          <div className="mx-auto max-w-sm rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/restaurants/${result.id}`}
                  className="text-lg font-bold text-neutral-900 hover:text-blue-600 dark:text-white"
                >
                  {result.name}
                </Link>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {result.cuisine} · {result.priceRange}
                </p>
              </div>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={getCuisineImage(result.cuisine, result.id)}
                  alt={result.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            </div>

            <div className="mt-2">
              <Rating value={result.rating} reviewCount={result.reviewCount} size="sm" />
            </div>

            {/* Social tags */}
            {(() => {
              const tags = getSocialTags(result);
              return tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", TAG_COLORS[tag.color])}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            <p className="mt-2 text-xs text-neutral-400">{result.address}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {result.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            {/* Menu preview */}
            {result.menuItems.length > 0 && (
              <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                <p className="mb-1.5 text-xs font-medium text-neutral-500">Platos destacados:</p>
                <ul className="space-y-1 text-xs">
                  {result.menuItems.slice(0, 2).map((item) => (
                    <li key={item.name} className="flex justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300">{item.name}</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        ${item.price.toLocaleString("es-CL")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href={`/restaurants/${result.id}`}
              className="mt-4 block w-full rounded-lg bg-neutral-900 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Ver restaurante →
            </Link>
          </div>

          <button
            type="button"
            onClick={decide}
            disabled={spinning}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className={cn("h-4 w-4", spinning && "animate-spin")} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Otra sugerencia
          </button>
        </div>
      )}
    </div>
  );
}
