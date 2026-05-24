"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { Button } from "@/components/ui/button";
import { GeneralFields } from "../general-fields";
import { fetchCoords, type GeoPreview } from "../address-field";
import type { Restaurant } from "@/types";

type PriceRange = Restaurant["priceRange"];

interface GeneralTabProps {
  restaurantId: string;
}

export function GeneralTab({ restaurantId }: GeneralTabProps) {
  const { restaurants, updateRestaurant } = useRestaurantsStore();
  const restaurant = restaurants.find((r) => r.id === restaurantId)!;

  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [cuisine, setCuisine] = useState(restaurant.cuisine);
  const [priceRange, setPriceRange] = useState<PriceRange>(restaurant.priceRange);
  const [address, setAddress] = useState(restaurant.address);
  const [addressGeo, setAddressGeo] = useState<GeoPreview | null>(null);
  const [locationDetail, setLocationDetail] = useState(restaurant.locationDetail ?? "");
  const [openingHours, setOpeningHours] = useState(restaurant.openingHours);

  const save = async () => {
    let coords: { lat: number; lng: number } | undefined;
    if (addressGeo) {
      coords = { lat: addressGeo.lat, lng: addressGeo.lng };
    } else if (address !== restaurant.address) {
      const result = await fetchCoords(address.trim());
      if (result) coords = { lat: result.lat, lng: result.lng };
    }
    updateRestaurant(restaurantId, {
      name,
      description,
      cuisine,
      priceRange,
      address,
      locationDetail: locationDetail.trim() || undefined,
      openingHours,
      ...coords,
    });
    toast.success("Cambios guardados");
  };

  return (
    <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <GeneralFields
        name={name} onNameChange={setName}
        description={description} onDescriptionChange={setDescription}
        cuisine={cuisine} onCuisineChange={setCuisine}
        priceRange={priceRange} onPriceRangeChange={setPriceRange}
        address={address} onAddressChange={setAddress}
        onGeoChange={setAddressGeo}
        initialGeo={{ lat: restaurant.lat, lng: restaurant.lng, label: restaurant.address }}
        locationDetail={locationDetail} onLocationDetailChange={setLocationDetail}
        openingHours={openingHours} onOpeningHoursChange={setOpeningHours}
      />
      <div className="flex justify-end border-t border-neutral-100 pt-5 dark:border-neutral-800">
        <Button onClick={save}>Guardar cambios</Button>
      </div>
    </section>
  );
}
