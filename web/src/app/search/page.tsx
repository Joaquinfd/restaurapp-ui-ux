"use client";

import { GuidedSearch } from "@/components/search/guided-search";
import { LastSearch } from "@/components/search/last-search";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Buscar</h1>
      <GuidedSearch />
      <LastSearch />
    </div>
  );
}
