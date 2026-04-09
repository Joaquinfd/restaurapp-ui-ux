"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { SearchBar } from "@/components/search/search-bar";
import { GuidedSearch } from "@/components/search/guided-search";
import { RestaurantList } from "@/components/restaurants/restaurant-list";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const results = query
    ? MOCK_RESTAURANTS.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <>
      <div className="mb-6 max-w-xl">
        <SearchBar defaultValue={query} />
      </div>

      {!query && (
        <div className="mb-8">
          <GuidedSearch />
        </div>
      )}

      {query && (
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          {results.length} resultado{results.length !== 1 && "s"} para &quot;{query}&quot;
        </p>
      )}

      <RestaurantList
        restaurants={results}
        emptyMessage={query ? `No se encontraron resultados para "${query}".` : "Escribe algo para buscar restaurantes."}
      />
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Buscar</h1>
      <Suspense fallback={<div className="py-16 text-center text-neutral-400">Cargando...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
