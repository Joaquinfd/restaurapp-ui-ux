"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { useFiltersStore, selectActiveCount } from "@/store/filters.store";
import { applyFilters } from "@/lib/filters";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { QuickDecision } from "@/components/restaurants/quick-decision";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { PageContainer } from "@/components/layout/page-container";

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const { category, priceRanges, dietaryTags, minRating, setCategory, togglePrice, toggleDietary, setMinRating, clearAll } =
    useFiltersStore(useShallow((s) => s));
  const activeCount = useFiltersStore(selectActiveCount);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const qs = params.toString();
      router.replace(qs ? `/restaurants?${qs}` : "/restaurants", { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  const filtered = useMemo(() => {
    const byFilters = applyFilters(MOCK_RESTAURANTS, { category, priceRanges, dietaryTags, minRating });
    const q = query.trim().toLowerCase();
    if (!q) return byFilters;
    return byFilters.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, category, priceRanges, dietaryTags, minRating]);

  return (
    <PageContainer className="py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Restaurantes</h1>
        <div className="relative w-full sm:max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, cocina, etiqueta..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-8">
        <FilterBar
          filters={{ category, priceRanges, dietaryTags, minRating }}
          activeCount={activeCount}
          onCategoryChange={setCategory}
          onTogglePrice={togglePrice}
          onToggleDietary={toggleDietary}
          onSetMinRating={setMinRating}
          onClearAll={clearAll}
          resultCount={filtered.length}
        />
      </div>

      <div className="mb-8">
        <QuickDecision restaurants={filtered} />
      </div>

      <RestaurantList restaurants={filtered} />
    </PageContainer>
  );
}

export default function RestaurantsClient() {
  return (
    <Suspense fallback={<PageContainer className="py-8 text-muted-foreground">Cargando...</PageContainer>}>
      <RestaurantsContent />
    </Suspense>
  );
}
