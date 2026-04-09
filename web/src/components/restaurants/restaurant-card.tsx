import Link from "next/link";
import type { Restaurant } from "@/types";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Image placeholder */}
      <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800">
        <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {restaurant.name}
          </h3>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {restaurant.priceRange}
          </span>
        </div>

        <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">{restaurant.cuisine}</p>

        <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} size="sm" />

        <div className="mt-3 flex flex-wrap gap-1">
          {restaurant.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
