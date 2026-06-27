"use client";

import { useState } from "react";
import { useCompareStore } from "@/store/compare.store";
import { CompareModal } from "./compare-modal";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { items, remove, clearAll } = useCompareStore();
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md lg:bottom-0 lg:left-60 dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Comparar ({items.length}/3):
            </span>
            {items.map((r) => (
              <div
                key={r.id}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 py-1 pr-1 pl-3 text-sm dark:bg-neutral-800"
              >
                <span className="text-neutral-900 dark:text-white">{r.name}</span>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
                  aria-label={`Quitar ${r.name}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              disabled={items.length < 2}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                items.length >= 2
                  ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
              )}
            >
              Comparar
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <CompareModal
          restaurants={items}
          onClose={() => setShowModal(false)}
          onRemove={remove}
        />
      )}
    </>
  );
}
