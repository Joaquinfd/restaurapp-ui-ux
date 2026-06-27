"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fire03Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import type { GroupMatchResult, RestaurantTally } from "@/lib/group-match";
import type { Friend } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCuisineImage } from "@/lib/cuisine-images";
import { cn, pluralize } from "@/lib/utils";

interface MatchResultsProps {
  result: GroupMatchResult;
  groupId: string;
  groupName: string;
  onRestart: () => void;
}

function VoterAvatars({ likedBy, passedBy }: { likedBy: Friend[]; passedBy: Friend[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {likedBy.map((friend) => (
        <Avatar
          key={friend.id}
          size="sm"
          label={`${friend.name} votó que sí`}
          className="ring-2 ring-emerald-400 dark:ring-emerald-500"
        >
          {friend.avatar}
        </Avatar>
      ))}
      {passedBy.map((friend) => (
        <Avatar
          key={friend.id}
          size="sm"
          label={`${friend.name} pasó`}
          className="opacity-40 grayscale"
        >
          {friend.avatar}
        </Avatar>
      ))}
    </div>
  );
}

export function MatchResults({ result, groupId, groupName, onRestart }: MatchResultsProps) {
  const { topMatch, hasUnanimous, memberCount } = result;
  const ranked = result.tallies.filter((tally) => tally.likeCount > 0 && tally !== topMatch);

  return (
    <div className="space-y-6">
      {/* Hero / top match */}
      {topMatch ? (
        <Card
          className={cn(
            "group relative overflow-hidden rounded-4xl border py-0 shadow-sm ring-0 transition hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/40",
            hasUnanimous
              ? "border-emerald-200 dark:border-emerald-900/60"
              : "border-neutral-200 dark:border-neutral-800",
          )}
        >
          <Link
            href={`/restaurants/${topMatch.restaurant.id}`}
            aria-label={`Ver ${topMatch.restaurant.name}`}
            className="absolute inset-0 z-10 outline-none"
          />
          <div className="relative h-48 w-full sm:h-56">
            <Image
              src={getCuisineImage(topMatch.restaurant.cuisine, topMatch.restaurant.id)}
              alt={topMatch.restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 640px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase shadow-sm",
                  hasUnanimous ? "bg-emerald-500 text-white" : "bg-blue-600 text-white",
                )}
              >
                <HugeiconsIcon icon={Fire03Icon} strokeWidth={2} className="size-3.5" />
                {hasUnanimous ? "¡Match del grupo!" : "El más votado"}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
                {topMatch.restaurant.name}
              </h2>
              <p className="mt-1 text-sm text-white/85">
                {topMatch.restaurant.cuisine} · {topMatch.restaurant.priceRange} ·{" "}
                {topMatch.restaurant.address}
              </p>
            </div>
          </div>

          <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Rating
                value={topMatch.restaurant.rating}
                reviewCount={topMatch.restaurant.reviewCount}
              />
              <Badge variant={hasUnanimous ? "success" : "info"}>
                {topMatch.likeCount} de {memberCount} {pluralize(memberCount, "voto", "votos")}
              </Badge>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">
                {hasUnanimous ? "Le gustó a todo el grupo" : "Quién votó que sí"}
              </p>
              <VoterAvatars likedBy={topMatch.likedBy} passedBy={topMatch.passedBy} />
            </div>

            {topMatch.restaurant.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {topMatch.restaurant.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 py-0 ring-0 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <p className="text-base font-medium text-amber-900 dark:text-amber-200">
              Nadie aprobó ningún restaurante esta vez.
            </p>
            <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-100/80">
              Vuelve a votar y dale me gusta a alguna opción para encontrar un lugar para el grupo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ranking */}
      {ranked.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
            Ranking del grupo
          </h3>
          <ul className="space-y-3">
            {ranked.map((tally, position) => (
              <RankRow key={tally.restaurant.id} tally={tally} position={position + 2} />
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onRestart} variant="outline" size="lg">
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
          Repetir votación
        </Button>
        <Link href={`/groups/${groupId}`} className={buttonVariants({ size: "lg" })}>
          Volver a {groupName}
        </Link>
      </div>
    </div>
  );
}

function RankRow({ tally, position }: { tally: RestaurantTally; position: number }) {
  return (
    <li>
      <Card className="group relative gap-0 rounded-3xl border border-neutral-200 bg-white py-0 ring-0 transition hover:border-neutral-300 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500/40 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
        <Link
          href={`/restaurants/${tally.restaurant.id}`}
          aria-label={`Ver ${tally.restaurant.name}`}
          className="absolute inset-0 z-10 rounded-3xl outline-none"
        />
        <CardContent className="flex items-center gap-4 p-4">
          <span className="w-6 shrink-0 text-center text-lg font-bold text-neutral-300 dark:text-neutral-600">
            {position}
          </span>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <Image
              src={getCuisineImage(tally.restaurant.cuisine, tally.restaurant.id)}
              alt={tally.restaurant.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {tally.restaurant.name}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {tally.restaurant.cuisine} · {tally.restaurant.priceRange}
            </p>
            <div className="mt-2">
              <VoterAvatars likedBy={tally.likedBy} passedBy={tally.passedBy} />
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-yellow-500">
            ★ {tally.restaurant.rating.toFixed(1)}
          </span>
        </CardContent>
      </Card>
    </li>
  );
}
