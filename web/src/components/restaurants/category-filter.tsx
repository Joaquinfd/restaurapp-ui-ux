"use client";

import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        size="sm"
        variant={selected === null ? "default" : "outline"}
        onClick={() => onSelect(null)}
        className="shrink-0"
      >
        Todos
      </Button>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          size="sm"
          variant={selected === cat.slug ? "default" : "outline"}
          onClick={() => onSelect(cat.slug === selected ? null : cat.slug)}
          className="shrink-0"
        >
          {cat.icon} {cat.name}
        </Button>
      ))}
    </div>
  );
}
