"use client";

import Link from "next/link";
import { useRestaurantsStore } from "@/store/restaurants.store";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "./tabs/general-tab";
import { MenuTab } from "./tabs/menu-tab";
import { AmbianceTab } from "./tabs/ambiance-tab";
import { TagsTab } from "./tabs/tags-tab";
import { PhotosTab } from "./tabs/photos-tab";

const TABS = [
  { id: "general", label: "General", icon: "📋" },
  { id: "photos", label: "Fotos", icon: "🖼️" },
  { id: "menu", label: "Menú", icon: "🍽️" },
  { id: "ambiance", label: "Ambiente", icon: "🌟" },
  { id: "tags", label: "Etiquetas", icon: "🏷️" },
] as const;

interface EditFormProps {
  restaurantId: string;
}

export function EditForm({ restaurantId }: EditFormProps) {
  const restaurant = useRestaurantsStore((s) => s.restaurants.find((r) => r.id === restaurantId));

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Restaurante no encontrado.</p>
        <Link href="/manager" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
        <Link href="/manager" className="hover:text-foreground">
          Mis restaurantes
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{restaurant.name}</span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{restaurant.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {restaurant.cuisine} · {restaurant.address}
          </p>
        </div>
        <Link
          href={`/restaurants/${restaurantId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Ver página pública →
        </Link>
      </div>

      <Tabs defaultValue="general" className="w-full gap-6">
        <TabsList variant="line" className="w-full justify-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              <span>{t.icon}</span>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="general">
          <GeneralTab restaurantId={restaurantId} />
        </TabsContent>
        <TabsContent value="photos">
          <PhotosTab restaurantId={restaurantId} />
        </TabsContent>
        <TabsContent value="menu">
          <MenuTab restaurantId={restaurantId} />
        </TabsContent>
        <TabsContent value="ambiance">
          <AmbianceTab restaurantId={restaurantId} />
        </TabsContent>
        <TabsContent value="tags">
          <TagsTab restaurantId={restaurantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
