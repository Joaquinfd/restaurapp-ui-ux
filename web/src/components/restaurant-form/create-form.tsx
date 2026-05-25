"use client";

import { useState } from "react";
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
  const [submitting, setSubmitting] = useState(false);

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
      ambiance: { vibe: vibe || "Por definir", lighting: lighting || "Por definir", photos: [] },
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

        <section className="border-border rounded-xl border p-6">
          <h2 className="mb-5 text-base font-semibold">Ambiente (opcional)</h2>
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
          <p className="text-muted-foreground mt-3 text-xs">
            Podrás añadir fotos y más detalles del ambiente después de crear el restaurante.
          </p>
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
