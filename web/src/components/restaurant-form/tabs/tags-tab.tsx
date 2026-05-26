"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { DIETARY_RESTRICTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TagsTabProps {
  restaurantId: string;
}

export function TagsTab({ restaurantId }: TagsTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const [tags, setTags] = useState<string[]>(restaurant.tags);
  const [newTag, setNewTag] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>(restaurant.dietaryTags);

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setNewTag("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const toggleDietary = (tag: string) =>
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const save = () => {
    updateRestaurant(restaurantId, { tags, dietaryTags });
    toast.success("Etiquetas guardadas");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <Label className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Etiquetas generales
        </Label>
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-neutral-400 hover:text-red-500">✕</button>
            </span>
          ))}
          {tags.length === 0 && <p className="text-muted-foreground text-xs">Sin etiquetas aún.</p>}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ej. terraza, wifi, reservas…"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} className="shrink-0">Añadir</Button>
        </div>
      </div>

      <div>
        <Label className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Opciones dietéticas
        </Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {DIETARY_RESTRICTIONS.map((tag) => (
            <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={dietaryTags.includes(tag)} onCheckedChange={() => toggleDietary(tag)} />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <Button onClick={save}>Guardar etiquetas</Button>
      </div>
    </section>
  );
}
