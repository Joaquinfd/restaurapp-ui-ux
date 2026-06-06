"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { CATEGORIES, PRICE_OPTIONS, DIETARY_RESTRICTIONS } from "@/lib/constants";
import { useRestaurantsStore } from "@/store/restaurants.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserPreferences } from "@/types";

const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white";

const NAV_ITEMS = [
  { id: "personal", label: "Información personal", icon: "👤" },
  { id: "preferences", label: "Preferencias gastronómicas", icon: "🍽️" },
  { id: "notifications", label: "Notificaciones", icon: "🔔" },
  { id: "security", label: "Privacidad y seguridad", icon: "🔒" },
  { id: "manager", label: "Mis restaurantes", icon: "🏪" },
  { id: "danger", label: "Zona de peligro", icon: "⚠️" },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

export default function ProfileClient() {
  const [active, setActive] = useState<SectionId>("personal");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user, updatePreferences, removeOwnedRestaurant } = useUser();
  const { name, email } = user;
  const { restaurants, removeRestaurant } = useRestaurantsStore();
  const ownedRestaurants = restaurants.filter((r) => user.ownedRestaurants.includes(r.id));

  const [prefDraft, setPrefDraft] = useState<UserPreferences>(user.preferences);

  const handleDeleteRestaurant = (id: string) => {
    removeRestaurant(id);
    removeOwnedRestaurant(id);
    setDeletingId(null);
  };

  const toggleDietaryRestriction = (tag: string) =>
    setPrefDraft((d) => ({
      ...d,
      dietaryRestrictions: d.dietaryRestrictions.includes(tag)
        ? d.dietaryRestrictions.filter((t) => t !== tag)
        : [...d.dietaryRestrictions, tag],
    }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Avatar header ── */}
      <div className="mb-8 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-3xl dark:bg-neutral-800">
            👤
          </div>
          <button
            type="button"
            className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-800 text-[10px] text-white dark:border-neutral-900 dark:bg-neutral-600"
            title="Cambiar foto"
          >
            ✏️
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{name}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* ── Sidebar nav (desktop) / Tab strip (mobile) ── */}
        <nav className="shrink-0 md:w-52">
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-1 overflow-x-auto pb-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  active === item.id
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          {/* Desktop: vertical list */}
          <ul className="hidden space-y-1 md:block">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    active === item.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                    item.id === "danger" &&
                      active !== "danger" &&
                      "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Content panel ── */}
        <div className="min-w-0 flex-1">
          {active === "personal" && (
            <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="mb-5 text-lg font-semibold text-neutral-900 dark:text-white">
                Información personal
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Nombre
                  </label>
                  <input type="text" defaultValue={name} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Apellido
                  </label>
                  <input type="text" defaultValue="Apellido" className={INPUT_CLASS} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Email
                  </label>
                  <input type="email" defaultValue={email} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Teléfono
                  </label>
                  <input type="tel" defaultValue="+56 9 1234 5678" className={INPUT_CLASS} />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Guardar cambios
                </button>
              </div>
            </section>
          )}

          {active === "preferences" && (
            <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="mb-5 text-lg font-semibold text-neutral-900 dark:text-white">
                Preferencias gastronómicas
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Cocina favorita
                  </label>
                  <Select
                    value={prefDraft.favoriteCuisine ?? ""}
                    onValueChange={(v) =>
                      setPrefDraft((d) => ({ ...d, favoriteCuisine: v || null }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin preferencia</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Rango de precios preferido
                  </label>
                  <Select
                    value={prefDraft.priceRange ?? ""}
                    onValueChange={(v) =>
                      setPrefDraft((d) => ({
                        ...d,
                        priceRange: (v || null) as UserPreferences["priceRange"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin preferencia</SelectItem>
                      {PRICE_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Restricciones dietéticas
                </p>
                <div className="flex flex-wrap gap-3">
                  {DIETARY_RESTRICTIONS.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={prefDraft.dietaryRestrictions.includes(tag)}
                        onChange={() => toggleDietaryRestriction(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => updatePreferences(prefDraft)}
                  className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Guardar cambios
                </button>
              </div>
            </section>
          )}

          {active === "notifications" && (
            <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="mb-5 text-lg font-semibold text-neutral-900 dark:text-white">
                Notificaciones
              </h2>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {[
                  {
                    label: "Nuevos restaurantes en mi zona",
                    sub: "Te avisamos cuando abra algo nuevo cerca tuyo.",
                    defaultChecked: true,
                  },
                  {
                    label: "Recomendaciones semanales por email",
                    sub: "Un resumen cada semana con picks del equipo.",
                    defaultChecked: false,
                  },
                  {
                    label: "Alertas de ofertas y promociones",
                    sub: "Descuentos y eventos especiales.",
                    defaultChecked: true,
                  },
                  {
                    label: "Actualizaciones de restaurantes favoritos",
                    sub: "Cambios de horario, menú o cierre.",
                    defaultChecked: true,
                  },
                ].map(({ label, sub, defaultChecked }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {label}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={defaultChecked}
                      className="mt-0.5 rounded"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Guardar cambios
                </button>
              </div>
            </section>
          )}

          {active === "security" && (
            <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <h2 className="mb-5 text-lg font-semibold text-neutral-900 dark:text-white">
                Privacidad y seguridad
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Contraseña actual
                  </label>
                  <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Nueva contraseña
                    </label>
                    <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Confirmar contraseña
                    </label>
                    <input type="password" placeholder="••••••••" className={INPUT_CLASS} />
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
                  <input type="checkbox" className="mt-0.5 rounded" id="share-location" />
                  <label
                    htmlFor="share-location"
                    className="text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Compartir mi ubicación para sugerencias cercanas
                    <span className="block text-xs text-neutral-400">
                      Solo se usa para ordenar resultados, nunca se almacena.
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Actualizar contraseña
                </button>
              </div>
            </section>
          )}

          {active === "manager" && (
            <section className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Mi restaurante
                </h2>
                {user.role === "OWNER" && (
                  <Link
                    href="/manager"
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Ir al panel →
                  </Link>
                )}
              </div>

              {user.role === "DINER" ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-neutral-200 py-10 text-center dark:border-neutral-700">
                  <span className="text-4xl">🏪</span>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      ¿Eres dueño de un restaurante?
                    </p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Gestiona tu menú, fotos y atributos directamente desde la app.
                    </p>
                  </div>
                  <Link
                    href="/manager"
                    className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Comenzar como propietario
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ownedRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 py-8 text-center dark:border-neutral-700">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Aún no tienes restaurantes registrados.
                      </p>
                      <Link
                        href="/manager/new"
                        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                      >
                        + Añadir restaurante
                      </Link>
                    </div>
                  ) : (
                    <>
                      {ownedRestaurants.map((r) => (
                        <div
                          key={r.id}
                          className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800"
                        >
                          {/* Main row */}
                          <div className="flex items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                {r.name}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {r.cuisine} · {r.priceRange}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Link
                                href={`/manager/${r.id}`}
                                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeletingId(deletingId === r.id ? null : r.id)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>

                          {/* Inline confirmation */}
                          {deletingId === r.id && (
                            <div className="flex items-center justify-between gap-3 border-t border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/20">
                              <p className="text-xs text-red-700 dark:text-red-300">
                                ¿Eliminar <span className="font-semibold">{r.name}</span>? Esta
                                acción no se puede deshacer.
                              </p>
                              <div className="flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(null)}
                                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-white dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRestaurant(r.id)}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                  Sí, eliminar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="pt-1">
                        <Link
                          href="/manager/new"
                          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        >
                          + Añadir otro restaurante
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}

          {active === "danger" && (
            <section className="rounded-xl border border-red-200 p-6 dark:border-red-900/50">
              <h2 className="mb-1 text-lg font-semibold text-red-600 dark:text-red-400">
                Zona de peligro
              </h2>
              <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                Estas acciones son permanentes e irreversibles.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Cerrar sesión en todos los dispositivos
                    </p>
                    <p className="text-xs text-neutral-400">Invalida todas las sesiones activas.</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Cerrar sesiones
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-900/40">
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Eliminar cuenta
                    </p>
                    <p className="text-xs text-neutral-400">
                      Borra todos tus datos de forma permanente.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
