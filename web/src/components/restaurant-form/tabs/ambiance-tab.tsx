"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
  const [imageUrls, setImageUrls] = useState<string[]>(restaurant.ambiance.imageUrls ?? []);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [newPhotoEmoji, setNewPhotoEmoji] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("");

  function readImageFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImageUrls((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
  }

  const addPhoto = () => {
    if (!newPhotoEmoji.trim() || !newPhotoLabel.trim()) return;
    setPhotos((prev) => [...prev, { emoji: newPhotoEmoji.trim(), label: newPhotoLabel.trim() }]);
    setNewPhotoEmoji("");
    setNewPhotoLabel("");
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, j) => j !== i));

  const save = () => {
    updateRestaurant(restaurantId, { ambiance: { vibe, lighting, photos, imageUrls } });
    toast.success("Ambiente guardado");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Vibe / ambiente</Label>
          <Input
            type="text"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="Ej. Romántico, Familiar, Trendy…"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Iluminación</Label>
          <Input
            type="text"
            value={lighting}
            onChange={(e) => setLighting(e.target.value)}
            placeholder="Ej. Luz tenue con velas"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Fotos de ambiente</Label>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imageUrls.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
              >
                <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Eliminar foto"
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) readImageFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600"
          }`}
        >
          <svg
            className="h-6 w-6 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-muted-foreground">
            Haz clic o arrastra imágenes · PNG, JPG, WEBP
          </span>
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) readImageFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <p className="text-muted-foreground mb-3 text-sm font-medium">Tarjetas de ambiente</p>
        {photos.length > 0 && (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <span className="text-2xl">{photo.emoji}</span>
                <span className="flex-1 text-sm">{photo.label}</span>
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="text-muted-foreground text-xs hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-3 dark:border-neutral-700">
          <Input
            type="text"
            maxLength={2}
            placeholder="🍷"
            value={newPhotoEmoji}
            onChange={(e) => setNewPhotoEmoji(e.target.value)}
            className="w-16 text-center"
          />
          <Input
            type="text"
            placeholder="Descripción"
            value={newPhotoLabel}
            onChange={(e) => setNewPhotoLabel(e.target.value)}
          />
          <Button type="button" onClick={addPhoto} className="shrink-0">
            Añadir
          </Button>
        </div>
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <Button onClick={save}>Guardar ambiente</Button>
      </div>
    </section>
  );
}
