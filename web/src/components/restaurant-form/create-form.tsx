"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { CATEGORIES, DIETARY_RESTRICTIONS } from "@/lib/constants";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneralFields } from "./general-fields";
import { fetchCoords, FALLBACK_COORDS, type GeoPreview } from "./address-field";
import type { Restaurant } from "@/types";

type PriceRange = Restaurant["priceRange"];

export function CreateForm() {
  const router = useRouter();
  const { addOwnedRestaurant } = useUser();
  const addRestaurant = useRestaurantsStore((s) => s.addRestaurant);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState(CATEGORIES[0].name);
  const [priceRange, setPriceRange] = useState<PriceRange>("$$");
  const [address, setAddress] = useState("");
  const [addressGeo, setAddressGeo] = useState<GeoPreview | null>(null);
  const [locationDetail, setLocationDetail] = useState("");
  const [openingHours, setOpeningHours] = useState("12:00 - 23:00");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [vibe, setVibe] = useState("");
  const [lighting, setLighting] = useState("");
  const [ambianceImages, setAmbianceImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  function readImageFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setAmbianceImages((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
  }

  const toggleDietary = (tag: string) =>
    setDietaryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let coords: { lat: number; lng: number };
    if (addressGeo) {
      coords = { lat: addressGeo.lat, lng: addressGeo.lng };
    } else {
      const result = await fetchCoords(address.trim());
      coords = result ?? FALLBACK_COORDS;
    }
    const id = `r-${Date.now()}`;
    addRestaurant({
      id,
      name,
      description,
      image: "/placeholder-restaurant.jpg",
      cuisine,
      rating: 0,
      reviewCount: 0,
      priceRange,
      address,
      locationDetail: locationDetail.trim() || undefined,
      openingHours,
      tags: [],
      dietaryTags,
      menuItems: [],
      peerRecommendations: null,
      ambiance: { vibe: vibe || "Por definir", lighting: lighting || "Por definir", photos: [], imageUrls: ambianceImages },
      ...coords,
    });
    addOwnedRestaurant(id);
    router.push(`/manager/${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
        <Link href="/manager" className="hover:text-foreground">Mis restaurantes</Link>
        <span>/</span>
        <span className="text-foreground">Nuevo restaurante</span>
      </div>
      <h1 className="mb-7 text-2xl font-bold">Añadir restaurante</h1>

      <form onSubmit={handleSubmit} className="space-y-7">
        <section className="border-border rounded-xl border p-6">
          <h2 className="mb-5 text-base font-semibold">Información básica</h2>
          <GeneralFields
            name={name} onNameChange={setName}
            description={description} onDescriptionChange={setDescription}
            cuisine={cuisine} onCuisineChange={setCuisine}
            priceRange={priceRange} onPriceRangeChange={setPriceRange}
            address={address} onAddressChange={setAddress}
            onGeoChange={setAddressGeo}
            locationDetail={locationDetail} onLocationDetailChange={setLocationDetail}
            openingHours={openingHours} onOpeningHoursChange={setOpeningHours}
            required
          />
        </section>

        <section className="border-border rounded-xl border p-6">
          <h2 className="mb-4 text-base font-semibold">Opciones dietéticas</h2>
          <div className="flex flex-wrap gap-3">
            {DIETARY_RESTRICTIONS.map((tag) => (
              <label key={tag} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={dietaryTags.includes(tag)} onCheckedChange={() => toggleDietary(tag)} />
                {tag}
              </label>
            ))}
          </div>
        </section>

        <section className="border-border rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold">Ambiente (opcional)</h2>

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

            {ambianceImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ambianceImages.map((src, i) => (
                  <div key={i} className="group relative aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={src}
                      alt={`Foto de ambiente ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => setAmbianceImages((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Eliminar foto"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 text-xs"
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
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) readImageFiles(e.dataTransfer.files); }}
              className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm transition-colors ${
                dragOver
                  ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20"
                  : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-600"
              }`}
            >
              <svg className="h-6 w-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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
              onChange={(e) => { if (e.target.files) readImageFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link href="/manager" className={buttonVariants({ variant: "outline" })}>Cancelar</Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creando…" : "Crear restaurante →"}
          </Button>
        </div>
      </form>
    </div>
  );
}
