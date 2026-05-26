"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AmbiancePhoto } from "@/types";

interface AmbianceTabProps {
  restaurantId: string;
}

export function AmbianceTab({ restaurantId }: AmbianceTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const [vibe, setVibe] = useState(restaurant.ambiance.vibe);
  const [lighting, setLighting] = useState(restaurant.ambiance.lighting);
  const [photos, setPhotos] = useState<AmbiancePhoto[]>(restaurant.ambiance.photos);
  const [newPhotoEmoji, setNewPhotoEmoji] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("");

  const addPhoto = () => {
    if (!newPhotoEmoji.trim() || !newPhotoLabel.trim()) return;
    setPhotos((prev) => [...prev, { emoji: newPhotoEmoji.trim(), label: newPhotoLabel.trim() }]);
    setNewPhotoEmoji("");
    setNewPhotoLabel("");
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, j) => j !== i));

  const save = () => {
    updateRestaurant(restaurantId, { ambiance: { vibe, lighting, photos } });
    toast.success("Ambiente guardado");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Vibe / ambiente</Label>
          <Input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} placeholder="Ej. Romántico, Familiar, Trendy…" />
        </div>
        <div className="space-y-1.5">
          <Label>Iluminación</Label>
          <Input type="text" value={lighting} onChange={(e) => setLighting(e.target.value)} placeholder="Ej. Luz tenue con velas" />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">Fotos de ambiente</p>
        {photos.length > 0 && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {photos.map((photo, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                <span className="text-2xl">{photo.emoji}</span>
                <span className="flex-1 text-sm">{photo.label}</span>
                <button type="button" onClick={() => removePhoto(i)} className="text-muted-foreground text-xs hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-3 dark:border-neutral-700">
          <Input type="text" maxLength={2} placeholder="🍷" value={newPhotoEmoji} onChange={(e) => setNewPhotoEmoji(e.target.value)} className="w-16 text-center" />
          <Input type="text" placeholder="Descripción de la foto" value={newPhotoLabel} onChange={(e) => setNewPhotoLabel(e.target.value)} />
          <Button type="button" onClick={addPhoto} className="shrink-0">Añadir</Button>
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <Button onClick={save}>Guardar ambiente</Button>
      </div>
    </section>
  );
}
