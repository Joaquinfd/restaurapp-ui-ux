"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageContainer } from "@/components/layout/page-container";
import { InviteLink } from "@/components/groups/invite-link";
import { CompatibleRestaurants } from "@/components/groups/compatible-restaurants";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { getCuisineImage } from "@/lib/cuisine-images";
import { buildInviteLink } from "@/lib/groups";
import { pluralize } from "@/lib/utils";
import type { Group } from "@/types";

const GROUPS_STORAGE_KEY = "restaurapp-groups-state";

type GroupDetailClientProps = {
  id: string;
};

function readPersistedGroups(): Group[] {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((group): group is Group => {
        return (
          typeof group === "object" &&
          group !== null &&
          typeof (group as Group).id === "string" &&
          typeof (group as Group).name === "string" &&
          typeof (group as Group).createdAt === "string" &&
          Array.isArray((group as Group).memberIds)
        );
      })
      .map((group) => ({
        ...group,
        memberIds: group.memberIds.filter((id) => FRIENDS.some((friend) => friend.id === id)),
      }));
  } catch {
    return [];
  }
}

/** Stable no-op subscriber for the hydration-flag useSyncExternalStore. */
const subscribeNoop = () => () => {};

export default function GroupDetailClient({ id }: GroupDetailClientProps) {
  const router = useRouter();

  // `localStorage` is client-only, so resolve the group during render guarded by
  // a hydration flag (useSyncExternalStore) instead of effect + setState.
  const isLoaded = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const group = useMemo<Group | null>(() => {
    if (!isLoaded) return null;
    const persistedGroups = readPersistedGroups();
    return (
      persistedGroups.find((item) => item.id === id) ??
      MOCK_GROUPS.find((item) => item.id === id) ??
      null
    );
  }, [isLoaded, id]);

  const members = useMemo(
    () => FRIENDS.filter((friend) => group?.memberIds.includes(friend.id)),
    [group],
  );

  const recommendation = useMemo(
    () => recommendGroupRestaurants(MOCK_RESTAURANTS, members),
    [members],
  );

  const recommendedRestaurant = recommendation.recommendation;
  const otherCompatible = recommendation.compatibleRestaurants.slice(1);
  const inviteLink = group ? buildInviteLink(group.name, group.memberIds) : "";

  // Preset example groups live in constants and can't be edited or removed; only
  // groups the user created (persisted in this browser) are manageable.
  const isManageable = !!group && !MOCK_GROUPS.some((preset) => preset.id === group.id);

  const handleDelete = () => {
    if (!group) return;
    try {
      const remaining = readPersistedGroups().filter((item) => item.id !== group.id);
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(remaining));
      localStorage.removeItem(`restaurapp-group-match-${group.id}`);
    } catch {
      // Ignore persistence failures.
    }
    router.push("/groups");
  };

  if (!isLoaded) {
    return (
      <PageContainer className="max-w-4xl py-8">
        <Card className="gap-0 rounded-3xl border border-neutral-200 py-0 text-neutral-500 shadow-sm ring-0 dark:border-neutral-800 dark:text-neutral-400">
          <CardContent className="p-6 text-sm">Cargando grupo...</CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!group) {
    return (
      <PageContainer className="max-w-4xl py-8">
        <Card className="gap-0 rounded-3xl border border-neutral-200 py-0 shadow-sm ring-0 dark:border-neutral-800">
          <CardContent className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
                Grupo
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
                No encontramos este grupo
              </h1>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Puede que aún no se haya guardado o que el enlace sea antiguo.
              </p>
            </div>
            <div>
              <Link href="/groups" className={buttonVariants()}>
                Volver a grupos
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl space-y-6 py-8">
      {/* Header */}
      <div>
        <Link
          href="/groups"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
          Grupos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
              Grupo
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
              {group.name}
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              {members.length} {pluralize(members.length, "amigo", "amigos")} dentro del grupo.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/groups/${group.id}/match`} className={buttonVariants()}>
              🔥 Iniciar match grupal
            </Link>
            {isManageable && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Opciones de ${group.name}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none lg:size-9 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => router.push(`/groups?edit=${group.id}`)}>
                    <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Members + invite link */}
      <Card className="rounded-3xl border border-neutral-200 py-0 shadow-sm ring-0 dark:border-neutral-800 dark:bg-neutral-900">
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Miembros</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {members.length > 0 ? (
                members.map((friend) => (
                  <span
                    key={friend.id}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-neutral-950"
                  >
                    <span>{friend.avatar}</span>
                    {friend.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Este grupo todavía no tiene amigos.
                </p>
              )}
            </div>
          </div>

          <InviteLink
            link={inviteLink}
            label="Enlace de acceso (ficticio)"
            hint="Cópialo para compartirlo; abre esta vista de grupo."
          />
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="rounded-3xl border border-neutral-200 py-0 shadow-sm ring-0 dark:border-neutral-800 dark:bg-neutral-900">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Recomendación del grupo
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {recommendation.compatibleRestaurants.length}{" "}
                {pluralize(
                  recommendation.compatibleRestaurants.length,
                  "restaurante compatible",
                  "restaurantes compatibles",
                )}
                .
              </p>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Priorizado por rating y volumen de reseñas.
            </p>
          </div>

          {recommendedRestaurant ? (
            <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
              <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                <Image
                  src={getCuisineImage(recommendedRestaurant.cuisine, recommendedRestaurant.id)}
                  alt={recommendedRestaurant.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/restaurants/${recommendedRestaurant.id}`}
                      className="text-2xl font-bold text-neutral-950 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                    >
                      {recommendedRestaurant.name}
                    </Link>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {recommendedRestaurant.cuisine} · {recommendedRestaurant.priceRange} ·{" "}
                      {recommendedRestaurant.address}
                    </p>
                  </div>
                  <Rating
                    value={recommendedRestaurant.rating}
                    reviewCount={recommendedRestaurant.reviewCount}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {recommendedRestaurant.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-950">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Por qué funciona para este grupo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    Cumple con todas las restricciones combinadas del grupo:{" "}
                    {recommendation.requiredDietaryTags.join(", ")}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-base font-medium text-amber-900 dark:text-amber-200">
                No encontramos una recomendación para este grupo.
              </p>
            </div>
          )}

          {otherCompatible.length > 0 && (
            <CompatibleRestaurants
              restaurants={otherCompatible}
              title="Otras opciones para el grupo"
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
