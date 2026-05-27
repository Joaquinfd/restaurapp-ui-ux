"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { getCuisineImage } from "@/lib/cuisine-images";
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

export default function GroupDetailClient({ id }: GroupDetailClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    const persistedGroups = readPersistedGroups();
    const savedGroup = persistedGroups.find((item) => item.id === id);
    const presetGroup = MOCK_GROUPS.find((item) => item.id === id);

    setGroup(savedGroup ?? presetGroup ?? null);
    setIsLoaded(true);
  }, [id]);

  const members = useMemo(
    () => FRIENDS.filter((friend) => group?.memberIds.includes(friend.id)),
    [group],
  );

  const recommendation = useMemo(
    () => recommendGroupRestaurants(MOCK_RESTAURANTS, members),
    [members],
  );

  const recommendedRestaurant = recommendation.recommendation;
  const inviteLink = group ? `https://restaurapp.app/groups/join/${group.id}` : "";

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="gap-0 rounded-3xl border border-neutral-200 py-0 text-neutral-500 ring-0 shadow-sm dark:border-neutral-800 dark:text-neutral-400">
          <CardContent className="p-6 text-sm">Cargando grupo...</CardContent>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="gap-0 rounded-3xl border border-neutral-200 py-0 ring-0 shadow-sm dark:border-neutral-800">
          <CardContent className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
                Grupo
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
            Grupo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            {group.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {members.length} {pluralize(members.length, "amigo", "amigos")} dentro del grupo.
          </p>
        </div>
        <Link
          href="/groups"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver a grupos
        </Link>
      </div>

      {/* Main content */}
      <Card className="gap-6 rounded-3xl border border-neutral-200 py-6 ring-0 shadow-sm dark:border-neutral-800">
        {/* Members + invite link */}
        <CardContent className="flex flex-col gap-5">
          <Card className="gap-0 rounded-3xl border border-neutral-200 bg-neutral-50 py-0 ring-0 dark:border-neutral-800 dark:bg-neutral-950">
            <CardHeader className="px-5 pt-5 pb-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Miembros</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 px-5 pt-4 pb-5">
              <div className="flex flex-wrap gap-2">
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

              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Enlace de acceso
                </p>
                <p className="mt-2 break-all text-sm text-neutral-500 dark:text-neutral-400">
                  {inviteLink}
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  Este enlace es ficticio y abre esta vista de grupo.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="gap-0 rounded-3xl border border-neutral-200 bg-white py-0 ring-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    Recomendación del grupo
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {recommendation.compatibleRestaurants.length} restaurante
                    {recommendation.compatibleRestaurants.length === 1 ? "" : "s"} compatible
                    {recommendation.compatibleRestaurants.length === 1 ? "" : "s"}.
                  </p>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Priorizado por rating y volumen de reseñas.
                </p>
              </div>

              {recommendedRestaurant ? (
                <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                  <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
                    <Image
                      src={getCuisineImage(recommendedRestaurant.cuisine, recommendedRestaurant.id)}
                      alt={recommendedRestaurant.name}
                      fill
                      className="object-contain p-3"
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

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/restaurants/${recommendedRestaurant.id}`}
                        className={buttonVariants()}
                      >
                        Ver restaurante
                      </Link>
                      <Badge variant="secondary" className="h-auto rounded-2xl px-4 py-3 text-sm">
                        {recommendation.compatibleRestaurants.length} opción
                        {recommendation.compatibleRestaurants.length === 1 ? "" : "es"} compatible
                        {recommendation.compatibleRestaurants.length === 1 ? "" : "s"}
                      </Badge>
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
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
