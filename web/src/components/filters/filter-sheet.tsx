"use client";

import { useState } from "react";
import { PRICE_OPTIONS, DIETARY_OPTIONS, RATING_OPTIONS } from "@/lib/constants";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Filters } from "@/store/filters.store";

interface FilterSheetProps {
  filters: Filters;
  activeCount: number;
  onCategoryChange: (slug: string | null) => void;
  onTogglePrice: (price: string) => void;
  onToggleDietary: (tag: string) => void;
  onSetMinRating: (rating: number | null) => void;
  onClearAll: () => void;
  resultCount: number;
}

/**
 * Mobile/tablet filter affordance for `/restaurants`: the category chips stay
 * inline (quick access) and the rest of the filters live in a bottom sheet behind
 * a "Filtros" button. The full inline `FilterBar` is used at `lg+` instead — this
 * component is only mounted below `lg`, so desktop is untouched.
 */
export function FilterSheet({
  filters,
  activeCount,
  onCategoryChange,
  onTogglePrice,
  onToggleDietary,
  onSetMinRating,
  onClearAll,
  resultCount,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-start gap-2">
      {/* `items-start`, not `items-center`: CategoryFilter carries a `pb-2` for
          scrollbar clearance that the Filtros button lacks, so centering would
          misalign them. Aligning the tops lines up the chips and the button. */}
      <div className="min-w-0 flex-1">
        <CategoryFilter selected={filters.category} onSelect={onCategoryChange} />
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              />
            </svg>
            Filtros
            {activeCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtros</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-6 overflow-y-auto px-5 pb-2">
            <FilterGroup label="Precio">
              {PRICE_OPTIONS.map((price) => (
                <Button
                  key={price}
                  size="sm"
                  variant="outline"
                  onClick={() => onTogglePrice(price)}
                  className={cn(
                    filters.priceRanges.includes(price) &&
                      "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                  )}
                >
                  {price}
                </Button>
              ))}
            </FilterGroup>

            <FilterGroup label="Rating">
              {RATING_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant="outline"
                  onClick={() => onSetMinRating(filters.minRating === opt.value ? null : opt.value)}
                  className={cn(
                    filters.minRating === opt.value &&
                      "border-yellow-500 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-600 dark:text-yellow-400",
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </FilterGroup>

            <FilterGroup label="Dieta">
              {DIETARY_OPTIONS.map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleDietary(tag)}
                  className={cn(
                    filters.dietaryTags.includes(tag) &&
                      "border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600 dark:text-green-400",
                  )}
                >
                  {tag}
                </Button>
              ))}
            </FilterGroup>
          </div>

          <DrawerFooter>
            <Button onClick={() => setOpen(false)} className="w-full">
              Ver {resultCount} resultado{resultCount !== 1 ? "s" : ""}
            </Button>
            {activeCount > 0 && (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  onClick={onClearAll}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Limpiar filtros ({activeCount})
                </Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
