import Link from "next/link";
import Image from "next/image";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { getSocialTags } from "@/lib/social-tags";
import { AmbiancePreview } from "@/components/restaurants/ambiance-preview";
import { DetailMapAndMenu } from "@/components/restaurants/detail-centralized";
import { cn } from "@/lib/utils";
import { fetchOsmRestaurantByExternalId } from "@/lib/osm-restaurants";
import type { Restaurant } from "@/types";
import { getCuisineImage } from "@/lib/cuisine-images";

const TAG_COLORS = {
  yellow: "bg-yellow-400/90 text-yellow-900",
  blue: "bg-blue-500/90 text-white",
  green: "bg-green-500/90 text-white",
  purple: "bg-purple-500/90 text-white",
} as const;

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

function mapExternalToRestaurant(
  external: NonNullable<Awaited<ReturnType<typeof fetchOsmRestaurantByExternalId>>>,
): Restaurant {
  return {
    id: external.id,
    name: external.name,
    description:
      external.description ??
      "Datos obtenidos desde OpenStreetMap. Algunos campos pueden estar incompletos o desactualizados.",
    image: "/placeholder-restaurant.jpg",
    cuisine: external.cuisine ?? "No especificada",
    rating: 0,
    reviewCount: 0,
    priceRange: external.priceRange ?? "$$",
    address: external.address ?? "Direccion no disponible",
    openingHours: external.openingHours ?? "Horario no informado",
    tags: external.tags,
    dietaryTags: external.dietaryTags,
    menuItems: [
      {
        name: "Informacion no disponible",
        description: "OpenStreetMap no expone menu detallado para este local.",
        price: 0,
      },
    ],
    peerRecommendations: null,
    ambiance: {
      vibe: "No informado",
      lighting: "No informado",
      photos: [],
    },
    lat: external.lat,
    lng: external.lng,
  };
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  const mockRestaurant = MOCK_RESTAURANTS.find((r) => r.id === id);
  const externalRestaurant = mockRestaurant ? null : await fetchOsmRestaurantByExternalId(id);
  const restaurant =
    mockRestaurant ?? (externalRestaurant ? mapExternalToRestaurant(externalRestaurant) : null);
  const isExternal = !mockRestaurant && Boolean(externalRestaurant);

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mb-4 block text-6xl">😕</span>
        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
          Restaurante no encontrado
        </h1>
        <p className="mb-6 text-neutral-500 dark:text-neutral-400">
          El restaurante que buscas no existe.
        </p>
        <Link href="/restaurants" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Volver a restaurantes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/restaurants"
        className="mb-6 inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        ← Volver a restaurantes
      </Link>

      {/* Hero image */}
      <div className="relative mb-8 aspect-21/9 overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
        <Image
          src={getCuisineImage(restaurant.cuisine, restaurant.id)}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
          priority
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-start justify-between">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {restaurant.name}
            </h1>
            <span className="rounded-lg bg-neutral-100 px-3 py-1 text-sm font-semibold dark:bg-neutral-800">
              {restaurant.priceRange}
            </span>
          </div>

          {isExternal && (
            <p className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              Fuente externa (OpenStreetMap): este restaurante no fue creado en la app y sus datos
              pueden estar incompletos.
            </p>
          )}

          <p className="mb-4 text-neutral-500 dark:text-neutral-400">{restaurant.cuisine}</p>

          {!isExternal && <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} />}

          {/* Social validation tags */}
          {!isExternal &&
            (() => {
              const socialTags = getSocialTags(restaurant);
              return socialTags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialTags.map((tag) => (
                    <span
                      key={tag.label}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        TAG_COLORS[tag.color],
                      )}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

          <p className="mt-6 leading-relaxed text-neutral-700 dark:text-neutral-300">
            {restaurant.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          {/* Peer recommendation indicator */}
          {!isExternal && restaurant.peerRecommendations && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 dark:border-purple-800 dark:bg-purple-950/30">
              <svg
                className="h-5 w-5 shrink-0 text-purple-500"
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
              <div className="flex flex-1 items-center gap-2">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Recomendado por:
                </span>
                <div className="flex -space-x-2">
                  {restaurant.peerRecommendations.names.slice(0, 3).map((name) => {
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <div
                        key={name}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-400 text-xs font-bold text-white ring-2 ring-purple-50 dark:ring-purple-950"
                        title={name}
                      >
                        {initials}
                      </div>
                    );
                  })}
                  {restaurant.peerRecommendations.count > 3 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-300 text-xs font-bold text-purple-900 ring-2 ring-purple-50 dark:bg-purple-600 dark:text-white dark:ring-purple-950">
                      +{restaurant.peerRecommendations.count - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ambiance preview */}
          {!isExternal && restaurant.ambiance && <AmbiancePreview ambiance={restaurant.ambiance} />}

          {/* Menu section */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              🍴 Platos destacados
            </h2>
            <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-700 dark:border-neutral-800 dark:bg-neutral-900">
              {restaurant.menuItems.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
                    {item.price > 0 ? `$${item.price.toLocaleString("es-CL")}` : "N/D"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary tags */}
          {restaurant.dietaryTags.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                🥗 Opciones dietéticas
              </h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Información
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-neutral-500 dark:text-neutral-400">📍 Dirección</dt>
                <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.address}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500 dark:text-neutral-400">🕐 Horario</dt>
                <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.openingHours}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500 dark:text-neutral-400">
                  💰 Rango de precios
                </dt>
                <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.priceRange}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500 dark:text-neutral-400">🍳 Cocina</dt>
                <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.cuisine}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500 dark:text-neutral-400">💬 Reseñas</dt>
                <dd className="mt-1 text-neutral-900 dark:text-white">
                  {isExternal
                    ? "No disponibles en OpenStreetMap"
                    : `${restaurant.reviewCount} opiniones`}
                </dd>
              </div>
              {!isExternal && restaurant.ambiance && (
                <div>
                  <dt className="font-medium text-neutral-500 dark:text-neutral-400">
                    ✨ Ambiente
                  </dt>
                  <dd className="mt-1 text-neutral-900 dark:text-white">
                    {restaurant.ambiance.vibe}
                  </dd>
                </div>
              )}
              {isExternal && externalRestaurant?.phone && (
                <div>
                  <dt className="font-medium text-neutral-500 dark:text-neutral-400">
                    ☎️ Teléfono
                  </dt>
                  <dd className="mt-1 text-neutral-900 dark:text-white">
                    {externalRestaurant.phone}
                  </dd>
                </div>
              )}
              {isExternal && externalRestaurant?.website && (
                <div>
                  <dt className="font-medium text-neutral-500 dark:text-neutral-400">
                    🌐 Sitio web
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={externalRestaurant.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {externalRestaurant.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              ♥ Agregar a favoritos
            </button>
          </div>

          {/* Mini map */}
          <DetailMapAndMenu restaurant={restaurant} />
        </div>
      </div>
    </div>
  );
}
