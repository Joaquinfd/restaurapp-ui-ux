"use client";

import { useState, useMemo } from "react";
import { MOCK_RESTAURANTS, CATEGORIES } from "@/lib/constants";
import { saveLastSearch } from "@/lib/search-history";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  {
    id: "cuisine",
    title: "¿Qué tipo de cocina prefieres?",
    subtitle: "Selecciona una o más opciones",
  },
  { id: "price", title: "¿Cuál es tu presupuesto?", subtitle: "Elige un rango de precios" },
  { id: "vibe", title: "¿Qué ambiente buscas?", subtitle: "¿Cómo quieres que sea el lugar?" },
  {
    id: "dietary",
    title: "¿Tienes restricciones alimentarias?",
    subtitle: "Opcional — puedes saltar este paso",
  },
] as const;

const PRICE_CHOICES = [
  { value: "$", label: "$", desc: "Económico" },
  { value: "$$", label: "$$", desc: "Moderado" },
  { value: "$$$", label: "$$$", desc: "Premium" },
  { value: "$$$$", label: "$$$$", desc: "Gourmet" },
];

const VIBE_CHOICES = [
  { value: "Romántico", emoji: "🕯️" },
  { value: "Familiar / Acogedor", emoji: "🏡" },
  { value: "Zen / Minimalista", emoji: "🎋" },
  { value: "Festivo / Colorido", emoji: "🎊" },
  { value: "Urbano / Industrial", emoji: "🧱" },
  { value: "Costero / Fresco", emoji: "🌊" },
];

const DIETARY_CHOICES = [
  "vegano disponible",
  "sin gluten disponible",
  "pescatariano",
  "vegetariano disponible",
] as const;

export function GuidedSearch() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [vibes, setVibes] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  function toggle<T extends string>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  const results = useMemo(() => {
    return MOCK_RESTAURANTS.filter((r) => {
      if (cuisines.length > 0 && !cuisines.includes(r.cuisine)) return false;
      if (prices.length > 0 && !prices.includes(r.priceRange)) return false;
      if (vibes.length > 0 && !vibes.includes(r.ambiance?.vibe)) return false;
      if (dietary.length > 0 && !dietary.some((d) => r.dietaryTags.includes(d))) return false;
      return true;
    });
  }, [cuisines, prices, vibes, dietary]);

  function reset() {
    setStep(0);
    setCuisines([]);
    setPrices([]);
    setVibes([]);
    setDietary([]);
    setShowResults(false);
    setActive(false);
  }

  if (!active) {
    return (
      <Card className="py-12">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <div className="bg-primary/10 flex size-16 items-center justify-center rounded-2xl text-4xl">
            🧭
          </div>
          <div className="space-y-2">
            <p className="font-heading text-card-foreground text-2xl font-medium">
              Búsqueda guiada
            </p>
            <p className="text-muted-foreground mx-auto max-w-sm text-sm">
              Responde 4 preguntas rápidas y te recomendamos el restaurante ideal para ti.
            </p>
          </div>
          <Button size="lg" onClick={() => setActive(true)}>
            Comenzar búsqueda →
          </Button>
        </div>
      </Card>
    );
  }

  if (showResults) {
    const allChips = [...cuisines, ...prices, ...vibes, ...dietary];
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>🎯 Resultados para ti</CardTitle>
          <CardDescription>
            {results.length} restaurante{results.length !== 1 && "s"} coinciden con tus preferencias
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={reset}>
              Reiniciar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {allChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allChips.map((chip) => (
                <Badge key={chip}>{chip}</Badge>
              ))}
            </div>
          )}
          <RestaurantList
            restaurants={results}
            emptyMessage="No encontramos restaurantes con esas preferencias. Intenta con otros filtros."
          />
        </CardContent>
      </Card>
    );
  }

  const currentStep = STEPS[step];

  return (
    <Card>
      <div className="flex gap-1.5 px-6 pt-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <CardHeader>
        <CardTitle>{currentStep.title}</CardTitle>
        <CardDescription>
          Paso {step + 1} de {STEPS.length} · {currentStep.subtitle}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="xs" onClick={reset}>
            Cancelar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {step === 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggle(cuisines, cat.name, setCuisines)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-colors",
                  cuisines.includes(cat.name)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="text-2xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRICE_CHOICES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => toggle(prices, p.value, setPrices)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors",
                  prices.includes(p.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="text-lg font-bold">{p.label}</span>
                <span className="text-muted-foreground text-xs">{p.desc}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VIBE_CHOICES.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => toggle(vibes, v.value, setVibes)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border-2 p-3 text-sm font-medium transition-colors",
                  vibes.includes(v.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                <span className="text-xl">{v.emoji}</span>
                {v.value}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {DIETARY_CHOICES.map((d) => (
              <Button
                key={d}
                variant="outline"
                onClick={() => toggle(dietary, d, setDietary)}
                className={cn(
                  dietary.includes(d) &&
                    "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                )}
              >
                {d}
              </Button>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t">
        <Button
          variant="ghost"
          onClick={() => step > 0 && setStep(step - 1)}
          className={cn(step === 0 && "invisible")}
        >
          ← Anterior
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 && (
            <Button variant="outline" onClick={() => setStep(step + 1)}>
              Saltar
            </Button>
          )}
          <Button
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep(step + 1);
              } else {
                saveLastSearch({
                  cuisines,
                  prices,
                  vibes,
                  dietary,
                  resultIds: results.map((r) => r.id),
                  timestamp: Date.now(),
                });
                setShowResults(true);
              }
            }}
          >
            {step < STEPS.length - 1 ? "Siguiente →" : "Ver resultados 🎯"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
