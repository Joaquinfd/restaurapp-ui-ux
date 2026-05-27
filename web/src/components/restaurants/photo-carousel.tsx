"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
}

export function PhotoCarousel({ photos, alt }: PhotoCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div className="group relative mb-8 overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-800">
      <Carousel opts={{ loop: true }} setApi={setApi}>
        <CarouselContent className="ml-0">
          {photos.map((src, i) => (
            <CarouselItem key={src} className="pl-0">
              <div className="relative aspect-[21/9]">
                <Image
                  src={src}
                  alt={`${alt} — foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-3 border-0 bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60 hover:text-white focus-visible:opacity-100" />
        <CarouselNext className="right-3 border-0 bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60 hover:text-white focus-visible:opacity-100" />
      </Carousel>

      {photos.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Ir a foto ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
