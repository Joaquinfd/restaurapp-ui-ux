"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { Button } from "@/components/ui/button";
import { getCuisineImages } from "@/lib/cuisine-images";
import { cn } from "@/lib/utils";

interface PhotosTabProps {
  restaurantId: string;
}

export function PhotosTab({ restaurantId }: PhotosTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const defaultPhotos = getCuisineImages(restaurant.cuisine);
  const [photos, setPhotos] = useState<string[]>(restaurant.photos ?? defaultPhotos);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function readFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPhotos((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) readFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) readFiles(e.dataTransfer.files);
  }

  function remove(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    updateRestaurant(restaurantId, { photos });
    toast.success("Fotos guardadas");
  }

  function reset() {
    setPhotos(defaultPhotos);
  }

  const hasChanges = JSON.stringify(photos) !== JSON.stringify(restaurant.photos ?? defaultPhotos);

  return (
    <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Fotos del restaurante
        </h2>
        <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
          Estas fotos se muestran en el carrusel de la página pública. Mínimo 2 recomendadas.
        </p>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((src, i) => (
            <div
              key={i}
              className="group relative aspect-video overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
            >
              <Image
                src={src}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover transition-opacity group-hover:opacity-80"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized={src.startsWith("data:")}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Eliminar foto"
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors",
          dragOver
            ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
            : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600",
        )}
      >
        <svg
          className="h-8 w-8 text-neutral-400"
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
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Haz clic o arrastra imágenes aquí
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">PNG, JPG, WEBP</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <button
          type="button"
          onClick={reset}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Restaurar fotos por defecto
        </button>
        <Button onClick={save} disabled={!hasChanges}>
          Guardar fotos
        </Button>
      </div>
    </section>
  );
}
