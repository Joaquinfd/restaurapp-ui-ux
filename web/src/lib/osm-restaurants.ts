import type { ExternalRestaurant } from "@/types";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

function normalizePriceRange(value?: string): ExternalRestaurant["priceRange"] | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();

  if (["1", "cheap", "low", "$"].includes(normalized)) return "$";
  if (["2", "moderate", "mid", "$$"].includes(normalized)) return "$$";
  if (["3", "expensive", "high", "$$$"].includes(normalized)) return "$$$";
  if (["4", "luxury", "$$$$"].includes(normalized)) return "$$$$";

  return undefined;
}

function buildAddress(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  const address = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:country"],
  ]
    .filter(Boolean)
    .join(" ");

  return address || tags["addr:full"] || undefined;
}

function toTitleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getDietaryTags(tags: Record<string, string> | undefined): string[] {
  if (!tags) return [];

  const values: string[] = [];

  if (tags["diet:vegan"] === "yes") values.push("vegano");
  if (tags["diet:vegetarian"] === "yes") values.push("vegetariano");
  if (tags["diet:gluten_free"] === "yes") values.push("sin gluten");

  return values;
}

function getExperienceTags(tags: Record<string, string> | undefined): string[] {
  if (!tags) return [];

  const values: string[] = [];
  const cuisine = tags.cuisine
    ?.split(";")
    .map((part) => toTitleCase(part.replaceAll("_", " ").trim()))
    .filter(Boolean) ?? [];

  values.push(...cuisine);

  if (tags.takeaway === "yes") values.push("takeaway");
  if (tags.delivery === "yes") values.push("delivery");
  if (tags.outdoor_seating === "yes") values.push("terraza");
  if (tags.internet_access === "wlan") values.push("wifi");
  if (tags.wheelchair === "yes") values.push("accesible");

  return Array.from(new Set(values)).slice(0, 8);
}

function toExternalRestaurant(element: OverpassElement): ExternalRestaurant | null {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (lat == null || lng == null) return null;

  const tags = element.tags;
  const displayCuisine = tags?.cuisine
    ?.split(";")
    .map((part) => toTitleCase(part.replaceAll("_", " ").trim()))
    .filter(Boolean)
    .join(", ");

  return {
    id: `osm-${element.type}-${element.id}`,
    source: "osm",
    osmType: element.type,
    osmId: element.id,
    name: tags?.name ?? "Restaurante sin nombre",
    lat,
    lng,
    cuisine: displayCuisine || undefined,
    address: buildAddress(tags),
    openingHours: tags?.opening_hours,
    phone: tags?.phone ?? tags?.["contact:phone"],
    website: tags?.website ?? tags?.["contact:website"],
    description: tags?.description,
    priceRange: normalizePriceRange(tags?.price_range),
    tags: getExperienceTags(tags),
    dietaryTags: getDietaryTags(tags),
  };
}

async function queryOverpass(query: string): Promise<ExternalRestaurant[]> {
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    body: query,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("overpass-error");
  }

  const data = (await response.json()) as OverpassResponse;

  return (data.elements ?? [])
    .map((element) => toExternalRestaurant(element))
    .filter((restaurant): restaurant is ExternalRestaurant => Boolean(restaurant));
}

export async function fetchNearbyOsmRestaurants(
  lat: number,
  lng: number,
  radiusMeters = 2500,
): Promise<ExternalRestaurant[]> {
  const query = `
[out:json][timeout:20];
(
  node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  way["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
  relation["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});
);
out center tags;
`;

  return queryOverpass(query);
}

export async function fetchOsmRestaurantByExternalId(externalId: string): Promise<ExternalRestaurant | null> {
  const match = externalId.match(/^osm-(node|way|relation)-(\d+)$/);
  if (!match) return null;

  const [, osmType, osmId] = match;
  const query = `
[out:json][timeout:20];
${osmType}(${osmId});
out center tags;
`;

  const items = await queryOverpass(query);
  return items[0] ?? null;
}
