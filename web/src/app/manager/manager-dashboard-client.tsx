"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/hooks/use-user";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { buttonVariants } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { getCuisineImage } from "@/lib/cuisine-images";

export default function ManagerDashboardClient() {
  const { user } = useUser();
  const restaurants = useRestaurantsStore((s) => s.restaurants);
  const owned = restaurants.filter((r) => user.ownedRestaurants.includes(r.id));

  if (user.role === "DINER") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mb-6 text-6xl">🏪</div>
        <h1 className="mb-3 text-2xl font-bold text-neutral-900 dark:text-white">
          ¿Eres dueño de un restaurante?
        </h1>
        <p className="mb-8 text-neutral-500 dark:text-neutral-400">
          Registra tu restaurante y gestiona tu menú, fotos y toda la información que los comensales
          ven en RestaurApp.
        </p>
        <Link href="/manager/new" className={buttonVariants({ size: "lg" })}>
          + Añadir mi restaurante
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Mis restaurantes</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {owned.length}{" "}
            {owned.length === 1 ? "restaurante registrado" : "restaurantes registrados"}
          </p>
        </div>
        <Link href="/manager/new" className={buttonVariants()}>
          + Añadir restaurante
        </Link>
      </div>

      {owned.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
          <span className="text-5xl">🍽️</span>
          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Aún no tienes restaurantes registrados
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Añade tu primer restaurante para empezar.
            </p>
          </div>
          <Link href="/manager/new" className={buttonVariants({ size: "lg" })}>
            + Añadir restaurante
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((r) => (
            <div
              key={r.id}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
              {/* Image */}
              <div className="relative aspect-16/10 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <Image
                  src={getCuisineImage(r.cuisine, r.id)}
                  alt={r.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Info */}
              <div className="p-4 pb-3">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {r.name}
                  </h3>
                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {r.priceRange}
                  </span>
                </div>

                <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">{r.address}</p>

                <Rating value={r.rating} reviewCount={r.reviewCount} size="sm" />

                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Activo
                  </span>
                  <span className="text-xs text-neutral-400">{r.menuItems.length} platos</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <Link
                  href={`/manager/${r.id}`}
                  className={buttonVariants({ size: "sm", className: "flex-1 justify-center" })}
                >
                  Gestionar
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/restaurants/${r.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        />
                      }
                    >
                      👁
                    </TooltipTrigger>
                    <TooltipContent>Ver página pública</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
