import type { Restaurant } from "@/types";

export interface SocialTag {
  label: string;
  color: "yellow" | "blue" | "green" | "purple";
}

export function getSocialTags(restaurant: Restaurant): SocialTag[] {
  const tags: SocialTag[] = [];

  if (restaurant.rating >= 4.5) {
    tags.push({ label: "⭐ Muy valorado", color: "yellow" });
  }

  if (restaurant.reviewCount >= 200) {
    tags.push({ label: "🔥 Popular", color: "blue" });
  }

  if (restaurant.rating >= 4.3 && restaurant.reviewCount >= 100 && tags.length === 0) {
    tags.push({ label: "👍 Recomendado", color: "green" });
  }

  return tags;
}
