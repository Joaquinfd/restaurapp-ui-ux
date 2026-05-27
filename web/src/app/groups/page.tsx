"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, pluralize } from "@/lib/utils";
import { getCuisineImage } from "@/lib/cuisine-images";

const STORAGE_KEY = "restaurapp-group-state";
const GROUPS_STORAGE_KEY = "restaurapp-groups-state";
const DEFAULT_GROUP_NAME = "Cena entre amigos";

type StoredGroupState = {
  groupName: string;
  memberIds: string[];
};

type StoredGroup = {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
};

type StepId = "friends" | "recommendation";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInviteLink(groupName: string, memberIds: string[]) {
  const namePart = slugify(groupName) || "grupo";
  const friendPart = memberIds.join("-") || "sin-amigos";
  return `https://restaurapp.app/groups/join/${namePart}-${memberIds.length}-${friendPart}`;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(DEFAULT_GROUP_NAME);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLoadedGroups, setHasLoadedGroups] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [step, setStep] = useState<StepId>("friends");
  const [copied, setCopied] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<StoredGroupState>;
      if (typeof parsed.groupName === "string" && parsed.groupName.trim().length > 0) {
        setGroupName(parsed.groupName);
      }

      if (Array.isArray(parsed.memberIds)) {
        const validIds = parsed.memberIds.filter((id) =>
          FRIENDS.some((friend) => friend.id === id),
        );
        setMemberIds(validIds);
      }
    } catch {
      setMemberIds([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as StoredGroup[];
      if (!Array.isArray(parsed)) return;

      const validGroups = parsed
        .filter((group): group is StoredGroup => {
          return (
            typeof group?.id === "string" &&
            typeof group?.name === "string" &&
            typeof group?.createdAt === "string" &&
            Array.isArray(group?.memberIds)
          );
        })
        .map((group) => ({
          ...group,
          memberIds: group.memberIds.filter((id) => FRIENDS.some((friend) => friend.id === id)),
        }));

      if (validGroups.length > 0) {
        setGroups((current) => {
          const currentIds = new Set(current.map((group) => group.id));
          const merged = [...current];

          for (const group of validGroups) {
            if (currentIds.has(group.id)) continue;
            merged.unshift(group);
          }

          return merged;
        });
      }
    } catch {
      // Ignore corrupted persistence data.
    } finally {
      setHasLoadedGroups(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ groupName, memberIds } satisfies StoredGroupState),
    );
  }, [groupName, hasHydrated, memberIds]);

  useEffect(() => {
    if (!hasLoadedGroups) return;

    const persistedGroups = groups.filter(
      (group) => !MOCK_GROUPS.some((preset) => preset.id === group.id),
    );
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(persistedGroups));
  }, [groups, hasLoadedGroups]);

  const selectedFriends = useMemo(
    () => FRIENDS.filter((friend) => memberIds.includes(friend.id)),
    [memberIds],
  );

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();

    if (!query) {
      return FRIENDS;
    }

    return FRIENDS.filter((friend) => {
      const searchableText = [friend.name, ...friend.dietaryTags].join(" ").toLowerCase();
      return searchableText.includes(query);
    });
  }, [friendSearch]);

  const recommendationData = useMemo(
    () => recommendGroupRestaurants(MOCK_RESTAURANTS, selectedFriends),
    [selectedFriends],
  );

  const inviteLink = useMemo(() => buildInviteLink(groupName, memberIds), [groupName, memberIds]);

  useEffect(() => {
    setShowRecommendation(false);
  }, [groupName, memberIds]);

  const openCreateWizard = () => {
    setEditingGroupId(null);
    setIsCreatingGroup(true);
    setGroupName("Nuevo grupo");
    setMemberIds([]);
    setFriendSearch("");
    setStep("friends");
    setShowRecommendation(false);
    setCopied(false);
  };

  const handleToggleFriend = (friendId: string) => {
    setMemberIds((current) =>
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId],
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveGroup = () => {
    const newGroup = {
      id: editingGroupId ?? `group-${Date.now()}`,
      name: groupName.trim() || "Nuevo grupo",
      memberIds,
      createdAt: new Date().toISOString(),
    };

    setGroups((current) => {
      if (editingGroupId) {
        return current.map((group) =>
          group.id === editingGroupId ? { ...group, ...newGroup } : group,
        );
      }

      return [newGroup, ...current];
    });
    setIsCreatingGroup(false);
    setEditingGroupId(null);
    setStep("friends");
    setShowRecommendation(false);
    setFriendSearch("");
  };

  const compatibleRestaurants = recommendationData.compatibleRestaurants;
  const recommendedRestaurant = recommendationData.recommendation;
  const activeDietaryTags = recommendationData.requiredDietaryTags;
  const canRecommend = selectedFriends.length > 0;

  const presetGroups = useMemo(
    () =>
      MOCK_GROUPS.map((group) => ({
        ...group,
        members: FRIENDS.filter((friend) => group.memberIds.includes(friend.id)),
        inviteLink: buildInviteLink(group.name, group.memberIds),
        detailHref: `/groups/${group.id}`,
      })),
    [],
  );

  const sessionGroups = useMemo(
    () =>
      groups
        .filter((group) => !MOCK_GROUPS.some((preset) => preset.id === group.id))
        .map((group) => ({
          ...group,
          members: FRIENDS.filter((friend) => group.memberIds.includes(friend.id)),
          detailHref: `/groups/${group.id}`,
        })),
    [groups],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <section className="rounded-[2rem] border border-neutral-200 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,250,0.98))] p-6 shadow-sm dark:border-neutral-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(9,9,11,0.98))]">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-400">
            Grupos de amigos
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
            Crea un grupo y encuentra un restaurante compatible con todos.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base dark:text-neutral-300">
            Selecciona a tus amigos, combina sus restricciones alimentarias y deja que el sistema
            proponga un lugar que funcione para todo el grupo.
          </p>
        </div>
      </section>

      {/* ── Tus grupos ── */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Tus grupos</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Ya tienes {presetGroups.length} grupos creados y puedes abrir sus enlaces cuando
              quieras.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {presetGroups.map((group) => (
            <Card
              key={group.id}
              className="h-full gap-0 rounded-3xl border border-neutral-200 bg-neutral-50 py-0 ring-0 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-0">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Creado el{" "}
                    {new Date(group.createdAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {group.members.length} {pluralize(group.members.length, "amigo", "amigos")}
                </Badge>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 px-5 pt-4 pb-0">
                <div className="flex flex-wrap gap-2">
                  {group.members.map((friend) => (
                    <span
                      key={friend.id}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-800"
                    >
                      <span>{friend.avatar}</span>
                      {friend.name}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set(group.members.flatMap((friend) => friend.dietaryTags))).map(
                    (tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex flex-wrap gap-2 px-5 py-5">
                <Link href={group.detailHref} className={buttonVariants()}>
                  Entrar al grupo
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {sessionGroups.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
              Grupos creados en esta sesión
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {sessionGroups.map((group) => (
                <Card
                  key={group.id}
                  className="h-full gap-0 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 py-0 ring-0 dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-0">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {group.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {group.members.length} {pluralize(group.members.length, "amigo", "amigos")}{" "}
                        dentro
                      </p>
                    </div>
                    <Badge className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600">
                      Creado
                    </Badge>
                  </CardHeader>

                  <CardContent className="px-5 pt-4 pb-0">
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((friend) => (
                        <span
                          key={friend.id}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-800"
                        >
                          <span>{friend.avatar}</span>
                          {friend.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto flex flex-wrap gap-2 px-5 py-5">
                    <Link href={group.detailHref} className={buttonVariants()}>
                      Entrar al grupo
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={openCreateWizard} size="lg">
            + Crear nuevo grupo
          </Button>
        </div>
      </section>

      {/* ── Creation wizard ── */}
      {isCreatingGroup && (
        <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {/* Step nav */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  step === "friends"
                    ? "bg-blue-600 text-white hover:bg-blue-600"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800",
                )}
              >
                1. Amigos
              </Badge>
              <Badge
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  step === "recommendation"
                    ? "bg-blue-600 text-white hover:bg-blue-600"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800",
                )}
              >
                2. Recomendación
              </Badge>
            </div>
            <Badge variant="outline" className="rounded-full text-xs font-medium text-neutral-500">
              Se guarda en este navegador
            </Badge>
          </div>

          {/* ── Step 1: Friends ── */}
          {step === "friends" ? (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Paso 1: añade tus amigos
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Puedes dejar el grupo vacío si solo quieres compartir el enlace después.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="group-name"
                  className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
                >
                  Nombre del grupo
                </Label>
                <Input
                  id="group-name"
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  className="rounded-2xl"
                  placeholder="Ej. Cena del viernes"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="friend-search"
                    className="text-sm font-medium text-neutral-600 dark:text-neutral-300"
                  >
                    Buscar amigos
                  </Label>
                  <Input
                    id="friend-search"
                    type="text"
                    value={friendSearch}
                    onChange={(event) => setFriendSearch(event.target.value)}
                    className="rounded-2xl"
                    placeholder="Escribe un nombre o una dieta"
                  />
                </div>

                {/* Friend list */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:border-neutral-800 dark:text-neutral-400">
                    Lista desplegable
                  </div>

                  <div className="max-h-80 divide-y divide-neutral-200 overflow-auto dark:divide-neutral-800">
                    {filteredFriends.length > 0 ? (
                      filteredFriends.map((friend) => {
                        const selected = memberIds.includes(friend.id);

                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => handleToggleFriend(friend.id)}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900",
                              selected && "bg-blue-50 dark:bg-blue-500/10",
                            )}
                          >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                              {friend.avatar}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                    {friend.name}
                                  </p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {friend.dietaryTags.length}{" "}
                                    {pluralize(
                                      friend.dietaryTags.length,
                                      "restricción",
                                      "restricciones",
                                    )}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                    selected
                                      ? "bg-blue-600 text-white"
                                      : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
                                  )}
                                >
                                  {selected ? "Seleccionado" : "Agregar"}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {friend.dietaryTags.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
                        No hay amigos que coincidan con esa búsqueda.
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected friend chips */}
                <div className="flex flex-wrap gap-2">
                  {selectedFriends.length > 0 ? (
                    selectedFriends.map((friend) => (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => handleToggleFriend(friend.id)}
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        <span>{friend.avatar}</span>
                        {friend.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Todavía no has añadido amigos al grupo.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button size="lg" onClick={() => setStep("recommendation")}>
                  Continuar con este grupo
                </Button>
              </div>
            </section>
          ) : (
            /* ── Step 2: Recommendation ── */
            <section className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-blue-600 uppercase dark:text-blue-400">
                    Paso 2: recomendación
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-white">
                    {groupName || DEFAULT_GROUP_NAME}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    El sistema cruza las restricciones de todos los miembros y prioriza la mejor
                    opción por rating y reseñas.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep("friends")}>
                  Volver
                </Button>
              </div>

              {/* Members + invite link */}
              <Card className="gap-0 rounded-3xl border border-neutral-200 bg-neutral-50 py-0 ring-0 dark:border-neutral-800 dark:bg-neutral-950">
                <CardContent className="flex flex-col gap-5 p-5">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Miembros del grupo
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFriends.length > 0 ? (
                        selectedFriends.map((friend) => (
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
                          Todavía no hay amigos dentro del grupo.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Enlace ficticio
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <p className="min-w-0 flex-1 font-mono text-sm break-all text-neutral-500 dark:text-neutral-400">
                        {inviteLink}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={handleCopyLink}
                          aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
                          className="ml-2 shrink-0 rounded-2xl"
                        >
                          <HugeiconsIcon
                            icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                        </Button>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add/remove friends */}
              <Card className="gap-0 rounded-3xl border border-neutral-200 bg-white py-0 shadow-sm ring-0 dark:border-neutral-800 dark:bg-neutral-900">
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Agregar amigos
                      </p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Puedes sumar o quitar personas antes de recomendar.
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs font-medium text-neutral-500"
                    >
                      {selectedFriends.length} dentro
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {FRIENDS.map((friend) => {
                      const selected = memberIds.includes(friend.id);

                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => handleToggleFriend(friend.id)}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-all duration-200",
                            selected
                              ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10"
                              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:bg-neutral-900",
                          )}
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                              {friend.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                {friend.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {friend.dietaryTags.length}{" "}
                                {pluralize(
                                  friend.dietaryTags.length,
                                  "restricción",
                                  "restricciones",
                                )}
                              </p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger render={<span className="inline-flex" />}>
                                  <Badge
                                    variant={selected ? "default" : "secondary"}
                                    className={cn(
                                      "size-9 shrink-0 rounded-full px-3 py-1.5 text-[18px] font-semibold",
                                      selected
                                        ? "bg-blue-600 text-white hover:bg-blue-600"
                                        : "text-neutral-600 dark:text-neutral-300",
                                    )}
                                  >
                                    <HugeiconsIcon
                                      icon={selected ? MinusSignIcon : AddIcon}
                                      strokeWidth={2}
                                      className="size-7"
                                    />
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>{selected ? "Quitar" : "Agregar"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {friend.dietaryTags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recommend CTA */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={() => setShowRecommendation(true)}
                  disabled={!canRecommend}
                  className="bg-blue-600 px-5 text-white hover:bg-blue-700"
                  size="lg"
                >
                  🍽️ Recomendar restaurante
                </Button>

                {!canRecommend && (
                  <p className="text-center text-sm text-amber-700 dark:text-amber-300">
                    Agrega al menos un amigo para habilitar la recomendación.
                  </p>
                )}
              </div>

              {/* Recommendation result */}
              <Card className="gap-0 rounded-3xl border border-neutral-200 bg-white py-0 shadow-sm ring-0 dark:border-neutral-800 dark:bg-neutral-900">
                <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Recomendación del grupo
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {compatibleRestaurants.length}{" "}
                        {pluralize(compatibleRestaurants.length, "restaurante", "restaurantes")}{" "}
                        compatible{compatibleRestaurants.length === 1 ? "" : "s"}.
                      </p>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Priorizado por rating y volumen de reseñas.
                    </p>
                  </div>

                  {!showRecommendation ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-950">
                      <p className="text-base font-medium text-neutral-900 dark:text-white">
                        Todavía no has generado la recomendación.
                      </p>
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Cuando pulses el botón de arriba, aquí aparecerá el restaurante recomendado
                        para el grupo.
                      </p>
                    </div>
                  ) : recommendedRestaurant ? (
                    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                      <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
                        <Image
                          src={getCuisineImage(
                            recommendedRestaurant.cuisine,
                            recommendedRestaurant.id,
                          )}
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
                            Por qué funciona para el grupo
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            Cumple con todas las restricciones combinadas del grupo:{" "}
                            {activeDietaryTags.join(", ")}.
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/restaurants/${recommendedRestaurant.id}`}
                            className={buttonVariants()}
                          >
                            Ver restaurante
                          </Link>
                          <Badge
                            variant="secondary"
                            className="h-auto rounded-2xl px-4 py-3 text-sm"
                          >
                            {compatibleRestaurants.length} opción
                            {compatibleRestaurants.length === 1 ? "" : "es"} compatible
                            {compatibleRestaurants.length === 1 ? "" : "s"}
                          </Badge>
                        </div>

                        {compatibleRestaurants.length > 1 && (
                          <div className="mt-6">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              Alternativas compatibles
                            </p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {compatibleRestaurants.slice(1, 3).map((restaurant) => (
                                <Card
                                  key={restaurant.id}
                                  className="gap-0 rounded-2xl border border-neutral-200 bg-white py-0 ring-0 dark:border-neutral-800 dark:bg-neutral-950"
                                >
                                  <CardContent className="flex flex-col gap-3 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">
                                          {restaurant.name}
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                          {restaurant.cuisine} · {restaurant.priceRange}
                                        </p>
                                      </div>
                                      <span className="text-sm font-semibold text-yellow-500">
                                        ★ {restaurant.rating.toFixed(1)}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {restaurant.dietaryTags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <p className="text-base font-medium text-amber-900 dark:text-amber-200">
                        No encontramos un restaurante que cumpla con todas las dietas del grupo.
                      </p>
                      <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-100/80">
                        Prueba quitando un amigo o cambiando la composición del grupo para abrir más
                        opciones.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveGroup}
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Guardar grupo
                </Button>
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
