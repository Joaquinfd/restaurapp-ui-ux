import type { Friend, Restaurant } from "@/types";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";

/** A single accept/deny decision on a restaurant card. */
export type SwipeVote = "like" | "nope";

/** How many cards a single match session shows, so a round stays short on mobile. */
export const MATCH_DECK_SIZE = 12;

const PRICE_ORDER: Record<Restaurant["priceRange"], number> = {
  $: 1,
  $$: 2,
  $$$: 3,
  $$$$: 4,
};

export interface RestaurantTally {
  restaurant: Restaurant;
  likeCount: number;
  /** Members (including the real user) who liked this restaurant. */
  likedBy: Friend[];
  /** Members who passed on it. */
  passedBy: Friend[];
  /** Liked by every member in the group. */
  unanimous: boolean;
}

export interface GroupMatchResult {
  tallies: RestaurantTally[];
  topMatch: RestaurantTally | null;
  hasUnanimous: boolean;
  /** Total members considered (real user counts as one of the members). */
  memberCount: number;
}

/**
 * Build the swipe deck for a group: the existing recommendation engine already
 * hard-filters by the group's combined dietary restrictions and sorts by quality,
 * so we reuse it and then cap the deck length.
 */
export function buildGroupDeck(restaurants: Restaurant[], members: Friend[]): Restaurant[] {
  const { compatibleRestaurants } = recommendGroupRestaurants(restaurants, members);
  return compatibleRestaurants.slice(0, MATCH_DECK_SIZE);
}

/** Stable, order-independent hash of two ids → [0, 1). Keeps simulated votes reproducible. */
function seededUnit(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Map the 32-bit hash into [0, 1).
  return ((hash >>> 0) % 100000) / 100000;
}

/**
 * Deterministically decide how a simulated member votes on a restaurant. The deck
 * already satisfies everyone's restrictions, so votes are driven by *preferences*:
 * the restaurant's quality, a cuisine affinity, and price comfort. A seeded hash of
 * member + restaurant makes the result stable across re-renders and reloads.
 */
export function simulateMemberVote(member: Friend, restaurant: Restaurant): SwipeVote {
  // Base enthusiasm from rating: 3.5★ ≈ 0.45, 5★ ≈ 0.95.
  let likeProbability = 0.45 + (restaurant.rating - 3.5) * 0.33;

  const favourites = member.favoriteCuisines ?? [];
  if (favourites.some((cuisine) => cuisine.toLowerCase() === restaurant.cuisine.toLowerCase())) {
    likeProbability += 0.28;
  }

  const comfort = member.priceComfort;
  if (comfort && comfort.length > 0) {
    if (comfort.includes(restaurant.priceRange)) {
      likeProbability += 0.08;
    } else {
      // Penalty grows with how far the price sits outside the comfort band.
      const nearest = Math.min(
        ...comfort.map((band) => Math.abs(PRICE_ORDER[band] - PRICE_ORDER[restaurant.priceRange])),
      );
      likeProbability -= 0.18 * nearest;
    }
  }

  likeProbability = Math.min(0.95, Math.max(0.05, likeProbability));

  return seededUnit(`${member.id}::${restaurant.id}`) < likeProbability ? "like" : "nope";
}

function sortTallies(a: RestaurantTally, b: RestaurantTally): number {
  return (
    Number(b.unanimous) - Number(a.unanimous) ||
    b.likeCount - a.likeCount ||
    b.restaurant.rating - a.restaurant.rating ||
    b.restaurant.reviewCount - a.restaurant.reviewCount ||
    a.restaurant.name.localeCompare(b.restaurant.name)
  );
}

/**
 * Combine the real user's swipes with each simulated member's vote to tally the deck.
 * `currentUser` is the human swiping; the remaining `members` are simulated.
 */
export function computeMatchResults(
  deck: Restaurant[],
  members: Friend[],
  userVotes: Record<string, SwipeVote>,
  currentUser: Friend,
): GroupMatchResult {
  const simulated = members.filter((member) => member.id !== currentUser.id);
  const memberCount = simulated.length + 1;

  const tallies: RestaurantTally[] = deck.map((restaurant) => {
    const likedBy: Friend[] = [];
    const passedBy: Friend[] = [];

    if (userVotes[restaurant.id] === "like") {
      likedBy.push(currentUser);
    } else {
      passedBy.push(currentUser);
    }

    for (const member of simulated) {
      if (simulateMemberVote(member, restaurant) === "like") {
        likedBy.push(member);
      } else {
        passedBy.push(member);
      }
    }

    return {
      restaurant,
      likeCount: likedBy.length,
      likedBy,
      passedBy,
      unanimous: likedBy.length === memberCount,
    };
  });

  tallies.sort(sortTallies);

  const topMatch = tallies.find((tally) => tally.likeCount > 0) ?? null;

  return {
    tallies,
    topMatch,
    hasUnanimous: tallies.some((tally) => tally.unanimous),
    memberCount,
  };
}
