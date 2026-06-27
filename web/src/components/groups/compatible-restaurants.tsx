import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getCuisineImage } from "@/lib/cuisine-images";
import { pluralize } from "@/lib/utils";
import type { Restaurant } from "@/types";

interface CompatibleRestaurantsProps {
  /** The compatible restaurants to list — typically every option *except* the top one. */
  restaurants: Restaurant[];
  title?: string;
}

/** Lists the remaining restaurants that satisfy the group's combined restrictions, so the
 *  group can actually browse the alternatives instead of just reading a count. Rendered as a
 *  flat list of links (not nested cards) to keep the surrounding card from stacking depth. */
export function CompatibleRestaurants({
  restaurants,
  title = "Otras opciones compatibles",
}: CompatibleRestaurantsProps) {
  if (restaurants.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        {title} ·{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          {restaurants.length} {pluralize(restaurants.length, "restaurante", "restaurantes")}
        </span>
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <Link
              href={`/restaurants/${restaurant.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-950"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={getCuisineImage(restaurant.cuisine, restaurant.id)}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {restaurant.name}
                </p>
                <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                  {restaurant.cuisine} · {restaurant.priceRange}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {restaurant.dietaryTags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-yellow-500">
                ★ {restaurant.rating.toFixed(1)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
