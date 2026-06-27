"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { MOCK_RESTAURANTS } from "@/lib/constants";
import { FilterBar } from "@/components/filters/filter-bar";
import { FilterSheet } from "@/components/filters/filter-sheet";
import { useFiltersStore, selectActiveCount } from "@/store/filters.store";
import { applyFilters } from "@/lib/filters";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { QuickDecision } from "@/components/restaurants/quick-decision";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { PageContainer } from "@/components/layout/page-container";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const {
    category,
    priceRanges,
    dietaryTags,
    minRating,
    setCategory,
    togglePrice,
    toggleDietary,
    setMinRating,
    clearAll,
  } = useFiltersStore(useShallow((s) => s));
  const activeCount = useFiltersStore(selectActiveCount);

  // Keep the search query in the URL (?q=) without scrolling the page.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, router]);

  const filtered = useMemo(() => {
    const byFilters = applyFilters(MOCK_RESTAURANTS, {
      category,
      priceRanges,
      dietaryTags,
      minRating,
    });
    const q = query.trim().toLowerCase();
    if (!q) return byFilters;
    return byFilters.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query, category, priceRanges, dietaryTags, minRating]);

  const filterProps = {
    filters: { category, priceRanges, dietaryTags, minRating },
    activeCount,
    onCategoryChange: setCategory,
    onTogglePrice: togglePrice,
    onToggleDietary: toggleDietary,
    onSetMinRating: setMinRating,
    onClearAll: clearAll,
    resultCount: filtered.length,
  };

  return (
    <PageContainer className="py-6 sm:py-8">
      {/* Accessible page heading — the visible tagline now lives in the brand
          lockup (desktop sidebar), so the hero title is dropped here. */}
      <h1 className="sr-only">Descubre tu próximo restaurante favorito</h1>

      {/* Search */}
      <div className="relative mb-6 w-full sm:max-w-md">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, cocina, etiqueta..."
          className="pl-9"
        />
      </div>

      {/* Filters — inline bar on desktop, bottom sheet on mobile */}
      <div className="mb-6 sm:mb-8">
        <div className="hidden lg:block">
          <FilterBar {...filterProps} />
        </div>
        <div className="lg:hidden">
          <FilterSheet {...filterProps} />
        </div>
      </div>

      {/* Decidir por mí — the app's flagship "choose for me" feature */}
      <div className="mb-6 sm:mb-8">
        <QuickDecision restaurants={filtered} />
      </div>

      <RestaurantList restaurants={filtered} />
    </PageContainer>
  );
}

export default function HomeClient() {
  return (
    <Suspense
      fallback={<PageContainer className="text-muted-foreground py-8">Cargando...</PageContainer>}
    >
      <HomeContent />
    </Suspense>
  );
}
