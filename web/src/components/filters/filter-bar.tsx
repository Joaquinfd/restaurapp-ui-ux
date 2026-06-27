"use client";

import { cn } from "@/lib/utils";
import { PRICE_OPTIONS, DIETARY_OPTIONS, RATING_OPTIONS } from "@/lib/constants";
import { CategoryFilter } from "@/components/restaurants/category-filter";
import type { Filters } from "@/store/filters.store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, DollarIcon, LeafIcon, StarIcon } from "@hugeicons/core-free-icons";

interface FilterBarProps {
  filters: Filters;
  activeCount: number;
  onCategoryChange: (slug: string | null) => void;
  onTogglePrice: (price: string) => void;
  onToggleDietary: (tag: string) => void;
  onSetMinRating: (rating: number | null) => void;
  onClearAll: () => void;
  resultCount: number;
}

export function FilterBar({
  filters,
  activeCount,
  onCategoryChange,
  onTogglePrice,
  onToggleDietary,
  onSetMinRating,
  onClearAll,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <CategoryFilter selected={filters.category} onSelect={onCategoryChange} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="text-muted-foreground flex items-center gap-1">
          <HugeiconsIcon icon={DollarIcon} size={13} />
          <span className="text-xs font-medium">Precio</span>
        </div>
        {PRICE_OPTIONS.map((price) => (
          <Button
            key={price}
            size="xs"
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

        <span className="bg-border mx-1 h-4 w-px" />

        <div className="text-muted-foreground flex items-center gap-1">
          <HugeiconsIcon icon={StarIcon} size={13} />
          <span className="text-xs font-medium">Rating</span>
        </div>
        {RATING_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="xs"
            variant="outline"
            onClick={() => onSetMinRating(opt.value)}
            className={cn(
              filters.minRating === opt.value &&
                "border-yellow-500 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 hover:text-yellow-600 dark:text-yellow-400",
            )}
          >
            {opt.label}
          </Button>
        ))}

        <span className="bg-border mx-1 h-4 w-px" />

        <div className="text-muted-foreground flex items-center gap-1">
          <HugeiconsIcon icon={LeafIcon} size={13} />
          <span className="text-xs font-medium">Dieta</span>
        </div>
        {DIETARY_OPTIONS.map((tag) => (
          <Button
            key={tag}
            size="xs"
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
      </div>

      {activeCount > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </span>
          <Button
            size="xs"
            variant="ghost"
            onClick={onClearAll}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
            Limpiar ({activeCount})
          </Button>
        </div>
      )}
    </div>
  );
}
