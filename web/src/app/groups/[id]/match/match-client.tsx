"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { buildGroupDeck, computeMatchResults, type SwipeVote } from "@/lib/group-match";
import { useUser } from "@/hooks/use-user";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { SwipeDeck } from "@/components/groups/swipe-deck";
import { MatchResults } from "@/components/groups/match-results";
import { pluralize } from "@/lib/utils";
import type { Friend, Group } from "@/types";

const GROUPS_STORAGE_KEY = "restaurapp-groups-state";

type Phase = "intro" | "swiping" | "results";

function readPersistedGroups(): Group[] {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (group): group is Group =>
          typeof group === "object" &&
          group !== null &&
          typeof (group as Group).id === "string" &&
          typeof (group as Group).name === "string" &&
          typeof (group as Group).createdAt === "string" &&
          Array.isArray((group as Group).memberIds),
      )
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

export default function GroupMatchClient({ id }: { id: string }) {
  const { user } = useUser();
  const isLoaded = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const sessionKey = `restaurapp-group-match-${id}`;

  // Overrides layered on top of any restored session, so the restore can be derived
  // during render (no setState-in-effect) instead of an init effect.
  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(null);
  const [voteOverride, setVoteOverride] = useState<Record<string, SwipeVote> | null>(null);

  const group = useMemo<Group | null>(() => {
    if (!isLoaded) return null;
    return (
      readPersistedGroups().find((item) => item.id === id) ??
      MOCK_GROUPS.find((item) => item.id === id) ??
      null
    );
  }, [isLoaded, id]);

  const members = useMemo(
    () => FRIENDS.filter((friend) => group?.memberIds.includes(friend.id)),
    [group],
  );

  const deck = useMemo(() => buildGroupDeck(MOCK_RESTAURANTS, members), [members]);

  const requiredDietaryTags = useMemo(
    () => recommendGroupRestaurants(MOCK_RESTAURANTS, members).requiredDietaryTags,
    [members],
  );

  const currentUser = useMemo<Friend>(
    () => ({ id: "you", name: "Tú", avatar: user.avatar || "🧑", dietaryTags: [] }),
    [user.avatar],
  );

  // A finished session persisted in this browser, read during render.
  const restoredVotes = useMemo<Record<string, SwipeVote> | null>(() => {
    if (!isLoaded) return null;
    try {
      const raw = localStorage.getItem(sessionKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { votes?: Record<string, SwipeVote> };
      if (parsed?.votes && Object.keys(parsed.votes).length > 0) return parsed.votes;
    } catch {
      // Ignore corrupted persistence data.
    }
    return null;
  }, [isLoaded, sessionKey]);

  const phase: Phase = phaseOverride ?? (restoredVotes ? "results" : "intro");
  const userVotes = useMemo(
    () => voteOverride ?? restoredVotes ?? {},
    [voteOverride, restoredVotes],
  );

  // Persist the round when it finishes (no setState → safe inside an effect).
  useEffect(() => {
    if (phase !== "results") return;
    try {
      localStorage.setItem(sessionKey, JSON.stringify({ votes: userVotes }));
    } catch {
      // Ignore persistence failures.
    }
  }, [phase, sessionKey, userVotes]);

  const result = useMemo(
    () => computeMatchResults(deck, members, userVotes, currentUser),
    [deck, members, userVotes, currentUser],
  );

  const handleVote = useCallback((restaurantId: string, vote: SwipeVote) => {
    setVoteOverride((prev) => ({ ...(prev ?? {}), [restaurantId]: vote }));
  }, []);

  const handleUndo = useCallback((restaurantId: string) => {
    setVoteOverride((prev) => {
      const base = prev ?? {};
      if (!(restaurantId in base)) return prev;
      const next = { ...base };
      delete next[restaurantId];
      return next;
    });
  }, []);

  const handleComplete = useCallback(() => {
    setPhaseOverride("results");
  }, []);

  const handleStart = useCallback(() => {
    setVoteOverride({});
    setPhaseOverride("swiping");
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      // Ignore persistence failures.
    }
  }, [sessionKey]);

  if (!isLoaded) {
    return (
      <PageContainer className="max-w-2xl py-8">
        <Card className="rounded-3xl border border-neutral-200 py-0 text-neutral-500 ring-0 dark:border-neutral-800 dark:text-neutral-400">
          <CardContent className="p-6 text-sm">Cargando grupo...</CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!group) {
    return (
      <PageContainer className="max-w-2xl py-8">
        <Card className="rounded-3xl border border-neutral-200 py-0 ring-0 dark:border-neutral-800">
          <CardContent className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              No encontramos este grupo
            </h1>
            <Link href="/groups" className={buttonVariants()}>
              Volver a grupos
            </Link>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-2xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4" />
            Match grupal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
            {group.name}
          </h1>
        </div>
        <Link href={`/groups/${group.id}`} className={buttonVariants({ variant: "outline" })}>
          Salir
        </Link>
      </div>

      {phase === "intro" && (
        <Card className="rounded-3xl border border-neutral-200 py-0 shadow-sm ring-0 dark:border-neutral-800">
          <CardContent className="flex flex-col gap-6 p-6">
            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Desliza por {deck.length} {pluralize(deck.length, "restaurante", "restaurantes")}{" "}
              compatibles con el grupo. Tú votas en este dispositivo y las decisiones del resto del
              grupo se simulan según sus preferencias para obtener un resultado al instante.
            </p>

            <div>
              <p className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                Participantes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-blue-50 py-1 pr-3 pl-1 dark:bg-blue-950/40">
                  <Avatar size="sm">{currentUser.avatar}</Avatar>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Tú</span>
                </div>
                {members.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-2 rounded-full bg-neutral-100 py-1 pr-3 pl-1 dark:bg-neutral-800"
                  >
                    <Avatar size="sm">{friend.avatar}</Avatar>
                    <span className="text-sm text-neutral-700 dark:text-neutral-200">
                      {friend.name.split(" ")[0]}
                    </span>
                    <Badge variant="ghost" className="text-[10px] text-neutral-400">
                      simulada
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                Restricciones aplicadas
              </p>
              {requiredDietaryTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {requiredDietaryTags.map((tag) => (
                    <Badge key={tag} variant="success">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  El grupo no tiene restricciones alimentarias en común.
                </p>
              )}
            </div>

            {deck.length > 0 ? (
              <Button onClick={handleStart} size="lg" className="self-start">
                Empezar a votar
              </Button>
            ) : (
              <p className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                No hay restaurantes que cumplan con todas las restricciones del grupo. Ajusta los
                miembros e inténtalo de nuevo.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {phase === "swiping" && (
        <div className="h-[calc(100svh-15rem)] min-h-104">
          <SwipeDeck
            deck={deck}
            onVote={handleVote}
            onUndo={handleUndo}
            onComplete={handleComplete}
          />
        </div>
      )}

      {phase === "results" && (
        <MatchResults
          result={result}
          groupId={group.id}
          groupName={group.name}
          onRestart={handleStart}
        />
      )}
    </PageContainer>
  );
}
