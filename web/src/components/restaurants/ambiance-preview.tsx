import Image from "next/image";
import type { AmbianceInfo } from "@/types";

interface AmbiancePreviewProps {
  ambiance: AmbianceInfo;
}

export function AmbiancePreview({ ambiance }: AmbiancePreviewProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-foreground mb-1 text-lg font-semibold">Ambiente del lugar</h2>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          ✨ {ambiance.vibe}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          💡 {ambiance.lighting}
        </span>
      </div>

      {ambiance.imageUrls && ambiance.imageUrls.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ambiance.imageUrls.map((src, i) => (
            <div
              key={i}
              className="relative aspect-video overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700"
            >
              <Image
                src={src}
                alt={`Foto de ambiente ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {ambiance.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ambiance.photos.map((photo) => (
            <div
              key={photo.label}
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-4 text-center transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span className="text-3xl">{photo.emoji}</span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {photo.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
