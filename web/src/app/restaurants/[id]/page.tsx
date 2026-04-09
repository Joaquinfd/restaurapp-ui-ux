import Link from "next/link";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="mb-4 block text-6xl">😕</span>
        <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Restaurante no encontrado</h1>
        <p className="mb-6 text-neutral-500 dark:text-neutral-400">El restaurante que buscas no existe.</p>
        <Link href="/restaurants" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Volver a restaurantes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link href="/restaurants" className="mb-6 inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
        ← Volver a restaurantes
      </Link>

      {/* Hero image placeholder */}
      <div className="mb-8 aspect-[21/9] overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
        <div className="flex h-full items-center justify-center text-7xl">🍽️</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-start justify-between">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{restaurant.name}</h1>
            <span className="rounded-lg bg-neutral-100 px-3 py-1 text-sm font-semibold dark:bg-neutral-800">
              {restaurant.priceRange}
            </span>
          </div>

          <p className="mb-4 text-neutral-500 dark:text-neutral-400">{restaurant.cuisine}</p>

          <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} />

          <p className="mt-6 leading-relaxed text-neutral-700 dark:text-neutral-300">
            {restaurant.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {restaurant.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Información</h2>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400">Dirección</dt>
              <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.address}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400">Horario</dt>
              <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.openingHours}</dd>
            </div>
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400">Rango de precios</dt>
              <dd className="mt-1 text-neutral-900 dark:text-white">{restaurant.priceRange}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            ♥ Agregar a favoritos
          </button>
        </div>
      </div>
    </div>
  );
}
