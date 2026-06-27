import type { Friend, Restaurant } from "@/types";

export interface GroupRecommendation {
  requiredDietaryTags: string[];
  compatibleRestaurants: Restaurant[];
  recommendation: Restaurant | null;
}

function uniqueDietaryTags(friends: Friend[]): string[] {
  return Array.from(new Set(friends.flatMap((friend) => friend.dietaryTags)));
}

function sortCompatibleRestaurants(restaurants: Restaurant[]): Restaurant[] {
  return [...restaurants].sort(
    (left, right) =>
      right.rating - left.rating ||
      right.reviewCount - left.reviewCount ||
      left.name.localeCompare(right.name),
  );
}

export function recommendGroupRestaurants(
  restaurants: Restaurant[],
  friends: Friend[],
): GroupRecommendation {
  const requiredDietaryTags = uniqueDietaryTags(friends);
  const compatibleRestaurants = sortCompatibleRestaurants(
    restaurants.filter((restaurant) =>
      requiredDietaryTags.every((tag) => restaurant.dietaryTags.includes(tag)),
    ),
  );

  return {
    requiredDietaryTags,
    compatibleRestaurants,
    recommendation: compatibleRestaurants[0] ?? null,
  };
}
