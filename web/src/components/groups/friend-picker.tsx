"use client";

import { useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, pluralize } from "@/lib/utils";
import type { Friend } from "@/types";
import Image from "next/image";

interface FriendPickerProps {
  friends: Friend[];
  selectedIds: string[];
  onToggle: (friendId: string) => void;
  /** Show the search field that filters by name or dietary tag. */
  searchable?: boolean;
  className?: string;
}

/** The single friend-selection control used everywhere a group is assembled (create
 *  wizard step 1, step 2, and future edit). One scannable, searchable, tappable list —
 *  so the picker reads and behaves identically wherever it appears. */
export function FriendPicker({
  friends,
  selectedIds,
  onToggle,
  searchable = true,
  className,
}: FriendPickerProps) {
  const [query, setQuery] = useState("");
  const searchId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((friend) => {
      const haystack = [friend.name, ...friend.dietaryTags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [friends, query]);

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="space-y-2">
          <Label
            htmlFor={searchId}
            className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Buscar amigos
          </Label>
          <Input
            id={searchId}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-2xl"
            placeholder="Escribe un nombre o una dieta"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:border-neutral-800 dark:text-neutral-400">
          Tus amigos
        </div>

        <div className="max-h-80 divide-y divide-neutral-200 overflow-auto dark:divide-neutral-800">
          {filtered.length > 0 ? (
            filtered.map((friend) => {
              const selected = selectedIds.includes(friend.id);

              return (
                <button
                  key={friend.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggle(friend.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900",
                    selected && "bg-blue-50 dark:bg-blue-500/10",
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                    {/* <Image src={friend.avatar} alt={friend.name} className="h-7 w-7 rounded-full" /> */}
                    {friend.avatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                          {friend.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {friend.dietaryTags.length}{" "}
                          {pluralize(friend.dietaryTags.length, "restricción", "restricciones")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
                        )}
                      >
                        {selected ? "Seleccionado" : "Agregar"}
                      </span>
                    </div>

                    {friend.dietaryTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {friend.dietaryTags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <p className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
              No hay amigos que coincidan con esa búsqueda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
