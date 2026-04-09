"use client";

import { useState, useMemo } from "react";
import { MOCK_RESTAURANTS, CATEGORIES } from "@/lib/constants";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "cuisine", title: "¿Qué tipo de cocina prefieres?", subtitle: "Selecciona una o más opciones" },
  { id: "price", title: "¿Cuál es tu presupuesto?", subtitle: "Elige un rango de precios" },
  { id: "vibe", title: "¿Qué ambiente buscas?", subtitle: "¿Cómo quieres que sea el lugar?" },
  { id: "dietary", title: "¿Tienes restricciones alimentarias?", subtitle: "Opcional — puedes saltar este paso" },
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
];

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
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex items-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 px-5 py-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/30 dark:hover:border-blue-600 dark:hover:bg-blue-950/50"
      >
        <span className="text-2xl">🧭</span>
        <div>
          <p className="font-semibold text-blue-700 dark:text-blue-300">Búsqueda guiada</p>
          <p className="text-xs text-blue-500 dark:text-blue-400">Te ayudamos a encontrar el restaurante ideal paso a paso</p>
        </div>
      </button>
    );
  }

  if (showResults) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              🎯 Resultados para ti
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {results.length} restaurante{results.length !== 1 && "s"} coinciden con tus preferencias
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Reiniciar
          </button>
        </div>

        {/* Selected filters summary */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {cuisines.map((c) => (
            <span key={c} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{c}</span>
          ))}
          {prices.map((p) => (
            <span key={p} className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">{p}</span>
          ))}
          {vibes.map((v) => (
            <span key={v} className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{v}</span>
          ))}
          {dietary.map((d) => (
            <span key={d} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{d}</span>
          ))}
        </div>

        <RestaurantList restaurants={results} emptyMessage="No encontramos restaurantes con esas preferencias. Intenta con otros filtros." />
      </div>
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Progress bar */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "h-2 w-full rounded-full transition-colors",
                i <= step ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700"
              )}
            />
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-blue-500">Paso {step + 1} de {STEPS.length}</p>
        <button
          type="button"
          onClick={reset}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          Cancelar
        </button>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-neutral-900 dark:text-white">{currentStep.title}</h3>
      <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">{currentStep.subtitle}</p>

      {/* Step content */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => toggle(cuisines, cat.name, setCuisines)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                cuisines.includes(cat.name)
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
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
                "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors",
                prices.includes(p.value)
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              )}
            >
              <span className="text-lg font-bold">{p.label}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{p.desc}</span>
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
                "flex items-center gap-2.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                vibes.includes(v.value)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
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
            <button
              key={d}
              type="button"
              onClick={() => toggle(dietary, d, setDietary)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors",
                dietary.includes(d)
                  ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 0 && setStep(step - 1)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            step > 0
              ? "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              : "invisible"
          )}
        >
          ← Anterior
        </button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Saltar
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step < STEPS.length - 1) {
                setStep(step + 1);
              } else {
                setShowResults(true);
              }
            }}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {step < STEPS.length - 1 ? "Siguiente →" : "Ver resultados 🎯"}
          </button>
        </div>
      </div>
    </div>
  );
}
