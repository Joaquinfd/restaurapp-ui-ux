"use client";

import { GuidedSearch } from "@/components/search/guided-search";
import { LastSearch } from "@/components/search/last-search";
import { PageContainer } from "@/components/layout/page-container";

export default function SearchClient() {
  return (
    <PageContainer className="space-y-12 py-8">
      <h1 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-white">Buscar</h1>
      <GuidedSearch />
      <LastSearch />
    </PageContainer>
  );
}
