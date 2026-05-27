"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBar({ defaultValue = "", placeholder = "Buscar restaurantes, cocina, ubicación..." }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) router.push(`/restaurants?q=${encodeURIComponent(trimmed)}`);
      }}
      className="relative w-full"
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </form>
  );
}
