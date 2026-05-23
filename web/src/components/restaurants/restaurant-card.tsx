"use client";

import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { getSocialTags } from "@/lib/social-tags";
import { useCompareStore } from "@/store/compare.store";
import { cn } from "@/lib/utils";
import { getCuisineImage } from "@/lib/cuisine-images";

const TAG_COLORS = {
  yellow: "bg-yellow-400/90 text-yellow-900",
  blue: "bg-blue-500/90 text-white",
  green: "bg-green-500/90 text-white",
  purple: "bg-purple-500/90 text-white",
} as const;

interface RestaurantCardProps {
  restaurant: Restaurant;
  onQuickView?: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, onQuickView }: RestaurantCardProps) {
  const socialTags = getSocialTags(restaurant);
  const { isSelected, toggle, isFull } = useCompareStore();
  const compared = isSelected(restaurant.id);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <Link href={`/restaurants/${restaurant.id}`} className="block">
        {/* Restaurant image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          <Image
            src={getCuisineImage(restaurant.cuisine, restaurant.id)}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Social validation tags */}
          {socialTags.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {socialTags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm",
                    TAG_COLORS[tag.color],
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 pb-3">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {restaurant.name}
            </h3>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {restaurant.priceRange}
            </span>
          </div>

          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
            {restaurant.cuisine}
          </p>

          <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} size="sm" />

          <div className="mt-3 flex flex-wrap gap-1">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>

      {/* Bottom action row */}
      {(restaurant.peerRecommendations || (onQuickView && restaurant.menuItems.length > 0)) && (
        <div className="flex items-center justify-between gap-2 px-4 pb-4">
          {restaurant.peerRecommendations ? (
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span className="truncate">
                Recomendado por{" "}
                <strong>{restaurant.peerRecommendations.names.slice(0, 2).join(", ")}</strong>
                {restaurant.peerRecommendations.count > 2 && (
                  <> y {restaurant.peerRecommendations.count - 2} mas</>
                )}
              </span>
            </div>
          ) : (
            <span />
          )}

          {onQuickView && restaurant.menuItems.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(restaurant);
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-600 shadow-md ring-1 ring-neutral-200 transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:ring-offset-neutral-900 dark:hover:bg-neutral-700"
            >
              <span aria-hidden="true">🍴</span>
              Ver menú
            </button>
          )}
        </div>
      )}

      {/* Compare toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle(restaurant);
        }}
        disabled={!compared && isFull}
        className={cn(
          "absolute top-2 right-2 z-10 rounded-lg p-2 shadow-md transition-all",
          compared
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : isFull
              ? "cursor-not-allowed bg-white/70 text-neutral-300 opacity-100 dark:bg-neutral-800/70 dark:text-neutral-600"
              : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700",
        )}
        aria-label={compared ? "Quitar de comparación" : "Agregar a comparación"}
        title={compared ? "Quitar de comparación" : isFull ? "Máximo 3 restaurantes" : "Comparar"}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </button>
    </div>
  );
}
