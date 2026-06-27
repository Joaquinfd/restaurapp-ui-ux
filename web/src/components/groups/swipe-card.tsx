"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Clock01Icon,
  Location01Icon,
  MenuRestaurantIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { Restaurant } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { getSocialTags } from "@/lib/social-tags";
import { getCuisineImage, getCuisineImages } from "@/lib/cuisine-images";
import { cn } from "@/lib/utils";

const TAG_COLORS = {
  yellow: "bg-yellow-400/90 text-yellow-900",
  blue: "bg-blue-500/90 text-white",
  green: "bg-green-500/90 text-white",
  purple: "bg-purple-500/90 text-white",
} as const;

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

function SectionLabel({ icon, children }: { icon: IconType; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase dark:text-neutral-400">
      <HugeiconsIcon
        icon={icon}
        strokeWidth={2}
        className="size-4 text-neutral-400 dark:text-neutral-500"
      />
      {children}
    </p>
  );
}

/** Distinct photos for the gallery: primary + cuisine set + ambiance shots. */
function galleryFor(restaurant: Restaurant): string[] {
  return Array.from(
    new Set([
      getCuisineImage(restaurant.cuisine, restaurant.id),
      ...getCuisineImages(restaurant.cuisine),
      ...(restaurant.ambiance.imageUrls ?? []),
    ]),
  ).slice(0, 5);
}

interface SwipeCardProps {
  restaurant: Restaurant;
  /**
   * Cards peeking behind the active one: photo + identity only, no gallery taps,
   * scroll area, or detail sections, so they read as a clean stack edge.
   */
  isBackground?: boolean;
}

export function SwipeCard({ restaurant, isBackground = false }: SwipeCardProps) {
  const socialTags = getSocialTags(restaurant);
  const gallery = galleryFor(restaurant);
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasGallery = !isBackground && gallery.length > 1;

  const showPrev = () => setPhotoIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const showNext = () => setPhotoIndex((i) => (i + 1) % gallery.length);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      {/* Vertical scroll reveals the details; `pan-y` lets the deck keep horizontal
          gestures for voting while the browser handles vertical scrolling natively. */}
      <div
        className={cn(
          "h-full w-full [touch-action:pan-y] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          isBackground ? "overflow-hidden" : "overflow-y-auto overscroll-contain",
        )}
      >
        {/* First screen — photo + identity + description fill the visible height,
            so the menu and the sections below it only appear once you scroll. */}
        <div className="flex min-h-full flex-col">
          {/* Photo — top of the card, tap left/right to browse */}
          <div className="relative h-64 w-full shrink-0 bg-neutral-100 sm:h-72 dark:bg-neutral-800">
            <Image
              src={isBackground ? gallery[0] : gallery[photoIndex]}
              alt={restaurant.name}
              fill
              draggable={false}
              className="object-cover select-none"
              sizes="(max-width: 640px) 92vw, 420px"
              priority={!isBackground}
            />

            {hasGallery && (
              <>
                {/* Tap zones (a tap navigates; a drag still bubbles up to vote) */}
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={showPrev}
                  className="absolute inset-y-0 left-0 z-10 w-1/2 outline-none"
                />
                <button
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={showNext}
                  className="absolute inset-y-0 right-0 z-10 w-1/2 outline-none"
                />

                {/* Segmented progress */}
                <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex gap-1">
                  {gallery.map((src, i) => (
                    <span
                      key={src}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i === photoIndex ? "bg-white" : "bg-white/40",
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {!isBackground && socialTags.length > 0 && (
              <div
                className={cn(
                  "pointer-events-none absolute left-4 z-20 flex flex-wrap gap-1.5",
                  hasGallery ? "top-8" : "top-4",
                )}
              >
                {socialTags.map((tag) => (
                  <span
                    key={tag.label}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
                      TAG_COLORS[tag.color],
                    )}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Name + details — on the card's normal background */}
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-950 sm:text-2xl dark:text-white">
                {restaurant.name}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {restaurant.cuisine} · {restaurant.priceRange} · {restaurant.address}
              </p>
              <div className="mt-2">
                <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} />
              </div>
            </div>

            {(restaurant.dietaryTags.length > 0 || restaurant.tags.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {restaurant.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="success">
                    {tag}
                  </Badge>
                ))}
                {restaurant.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {restaurant.description}
            </p>
          </div>

          {/* Scroll cue, pinned to the bottom of the first screen above the buttons */}
          {!isBackground && (
            <div className="mt-auto flex justify-center px-5 pt-6 pb-28">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={2.5}
                  className="size-4 motion-safe:animate-bounce"
                />
                Desliza para ver el menú y más
              </span>
            </div>
          )}
        </div>

        {/* Below the fold — revealed by scrolling */}
        {!isBackground && (
          <div className="space-y-5 px-5 pb-24">
            {restaurant.menuItems.length > 0 && (
              <section className="space-y-3">
                <SectionLabel icon={MenuRestaurantIcon}>Menú destacado</SectionLabel>
                <ul className="space-y-3">
                  {restaurant.menuItems.map((item) => (
                    <li key={item.name} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
                        ${item.price.toLocaleString("es-CL")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-3">
              <SectionLabel icon={SparklesIcon}>Ambiente</SectionLabel>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {restaurant.ambiance.vibe} · {restaurant.ambiance.lighting}
              </p>
              {restaurant.ambiance.photos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {restaurant.ambiance.photos.map((photo) => (
                    <Badge key={photo.label} variant="secondary">
                      <span aria-hidden="true">{photo.emoji}</span> {photo.label}
                    </Badge>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-2">
              <SectionLabel icon={Clock01Icon}>Horario</SectionLabel>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {restaurant.openingHours}
              </p>
            </section>

            <section className="space-y-2">
              <SectionLabel icon={Location01Icon}>Ubicación</SectionLabel>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {restaurant.address}
                {restaurant.locationDetail ? ` · ${restaurant.locationDetail}` : ""}
              </p>
            </section>
          </div>
        )}
      </div>

      {/* "More below" affordance — fades content into the card's bottom edge */}
      {!isBackground && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-neutral-900" />
      )}
    </div>
  );
}
