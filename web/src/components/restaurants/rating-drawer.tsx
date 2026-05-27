"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const LABELS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

interface RatingDrawerProps {
  restaurantName: string;
}

export function RatingDrawer({ restaurantName }: RatingDrawerProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");

  const display = hovered || selected;

  function handleSubmit() {
    if (!selected) return;
    toast.success("¡Gracias por tu calificación!", {
      description: `Calificaste ${restaurantName} con ${selected} estrella${selected > 1 ? "s" : ""}.`,
    });
    setOpen(false);
    setSelected(0);
    setComment("");
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setHovered(0);
      setSelected(0);
      setComment("");
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="mt-3 w-full">
          ⭐ Calificar restaurante
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>¿Cómo fue tu experiencia?</DrawerTitle>
          <DrawerDescription>{restaurantName}</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col items-center gap-6 px-6 pb-2">
          {/* Stars */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex gap-2"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelected(star)}
                  onMouseEnter={() => setHovered(star)}
                  aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
                  className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  <svg
                    className="size-10"
                    viewBox="0 0 24 24"
                    fill={star <= display ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      className={star <= display ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              ))}
            </div>

            <p className="h-5 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {display ? LABELS[display] : "Selecciona una puntuación"}
            </p>
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu opinión (opcional)..."
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
          />
        </div>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={!selected} className="w-full">
            Publicar calificación
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
