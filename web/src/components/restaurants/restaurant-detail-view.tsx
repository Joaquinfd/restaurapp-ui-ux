"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { useUser } from "@/hooks/use-user";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSocialTags } from "@/lib/social-tags";
import { AmbiancePreview } from "@/components/restaurants/ambiance-preview";
import { DetailMapAndMenu } from "@/components/restaurants/detail-centralized";
import { PhotoCarousel } from "@/components/restaurants/photo-carousel";
import { RatingDrawer } from "@/components/restaurants/rating-drawer";
import { getCuisineImages } from "@/lib/cuisine-images";
import { PageContainer } from "@/components/layout/page-container";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const SOCIAL_TAG_VARIANT: Record<"yellow" | "blue" | "green" | "purple", BadgeVariant> = {
  yellow: "warning",
  blue: "info",
  green: "success",
  purple: "default",
};

interface RestaurantDetailViewProps {
  id: string;
}

export function RestaurantDetailView({ id }: RestaurantDetailViewProps) {
  const restaurant = useRestaurantsStore((s) => s.restaurants.find((r) => r.id === id) ?? null);
  const { toggleFavorite, isFavorite } = useUser();

  function handleFavorite() {
    const alreadyFav = isFavorite(id);
    toggleFavorite(id);
    if (alreadyFav) {
      toast("Eliminado de favoritos", { description: restaurant?.name });
    } else {
      toast.success("¡Agregado a favoritos!", { description: restaurant?.name });
    }
  }

  if (!restaurant) {
    return (
      <PageContainer className="py-16 text-center">
        <span className="mb-4 block text-6xl">😕</span>
        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
          Restaurante no encontrado
        </h1>
        <p className="mb-6 text-muted-foreground">El restaurante que buscas no existe.</p>
        <Link href="/restaurants" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Volver a restaurantes
        </Link>
      </PageContainer>
    );
  }

  const photos = restaurant.photos?.length
    ? restaurant.photos
    : getCuisineImages(restaurant.cuisine);

  const socialTags = getSocialTags(restaurant);

  return (
    <PageContainer className="py-8">
      <Link
        href="/restaurants"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a restaurantes
      </Link>

      <PhotoCarousel photos={photos} alt={restaurant.name} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Header */}
          <div>
            <div className="mb-2 flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
              <Badge variant="outline" className="mt-1 shrink-0 px-3 py-1 text-sm h-auto">
                {restaurant.priceRange}
              </Badge>
            </div>

            <Badge variant="secondary" className="mb-3">{restaurant.cuisine}</Badge>

            <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} />

            {socialTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {socialTags.map((tag) => (
                  <Badge key={tag.label} variant={SOCIAL_TAG_VARIANT[tag.color]}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
            )}

            <p className="mt-4 leading-relaxed text-muted-foreground">{restaurant.description}</p>

            {restaurant.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Peer recommendations */}
          {restaurant.peerRecommendations && (
            <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/30">
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
                <TooltipProvider>
                  <div className="flex -space-x-2">
                    {restaurant.peerRecommendations.names.slice(0, 3).map((name) => {
                      const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();
                      return (
                        <Tooltip key={name}>
                          <TooltipTrigger>
                            <div className="flex h-8 w-8 cursor-default items-center justify-center rounded-full bg-purple-400 text-xs font-bold text-white ring-2 ring-purple-50 dark:ring-purple-950">
                              {initials}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{name}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {restaurant.peerRecommendations.count > 3 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-300 text-xs font-bold text-purple-900 ring-2 ring-purple-50 dark:bg-purple-600 dark:text-white dark:ring-purple-950">
                        +{restaurant.peerRecommendations.count - 3}
                      </div>
                    )}
                  </div>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* Ambiance */}
          {restaurant.ambiance && <AmbiancePreview ambiance={restaurant.ambiance} />}

          {/* Menu */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">🍴 Platos destacados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {restaurant.menuItems.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                      <Badge variant="outline" className="mt-1.5">{item.type}</Badge>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
                      {item.price > 0 ? `$${item.price.toLocaleString("es-CL")}` : "N/D"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dietary tags */}
          {restaurant.dietaryTags.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-foreground">🥗 Opciones dietéticas</h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="success">✓ {tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">📍 Dirección</dt>
                  <dd className="mt-1 text-foreground">{restaurant.address}</dd>
                  {restaurant.locationDetail && (
                    <dd className="mt-0.5 text-xs text-muted-foreground">{restaurant.locationDetail}</dd>
                  )}
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">🕐 Horario</dt>
                  <dd className="mt-1 text-foreground">{restaurant.openingHours}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">💰 Precio</dt>
                  <dd className="mt-1">
                    <Badge variant="outline">{restaurant.priceRange}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">🍳 Cocina</dt>
                  <dd className="mt-1">
                    <Badge variant="secondary">{restaurant.cuisine}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">💬 Reseñas</dt>
                  <dd className="mt-1 text-foreground">{restaurant.reviewCount} opiniones</dd>
                </div>
                {restaurant.ambiance && (
                  <div>
                    <dt className="font-medium text-muted-foreground">✨ Ambiente</dt>
                    <dd className="mt-1 text-foreground">{restaurant.ambiance.vibe}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
            <CardFooter className="border-t flex-col gap-2 pt-6">
              <Button
                onClick={handleFavorite}
                className={`w-full text-white ${isFavorite(id) ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isFavorite(id) ? "♥ En favoritos" : "♡ Agregar a favoritos"}
              </Button>
              <RatingDrawer restaurantName={restaurant.name} />
            </CardFooter>
          </Card>

          <DetailMapAndMenu restaurant={restaurant} />
        </div>
      </div>
    </PageContainer>
  );
}
