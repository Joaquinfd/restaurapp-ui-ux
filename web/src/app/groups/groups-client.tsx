"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, pluralize } from "@/lib/utils";
import { getCuisineImage } from "@/lib/cuisine-images";
import { PageContainer } from "@/components/layout/page-container";
import { InviteLink } from "@/components/groups/invite-link";
import { CompatibleRestaurants } from "@/components/groups/compatible-restaurants";
import { FriendPicker } from "@/components/groups/friend-picker";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildInviteLink } from "@/lib/groups";

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

function GroupsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState(DEFAULT_GROUP_NAME);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLoadedGroups, setHasLoadedGroups] = useState(false);
  const [step, setStep] = useState<StepId>("friends");
  const [savedName, setSavedName] = useState<string | null>(null);
  const wizardRef = useRef<HTMLElement>(null);

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

  const recommendationData = useMemo(
    () => recommendGroupRestaurants(MOCK_RESTAURANTS, selectedFriends),
    [selectedFriends],
  );

  const inviteLink = useMemo(() => buildInviteLink(groupName, memberIds), [groupName, memberIds]);

  // Bring the wizard into view when it opens (create or edit), so the focal CTA and the
  // list "+ Crear" both lead straight into the flow instead of leaving it off-screen.
  useEffect(() => {
    if (isCreatingGroup) {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCreatingGroup, editingGroupId]);

  const openCreateWizard = () => {
    setEditingGroupId(null);
    setIsCreatingGroup(true);
    setGroupName("Nuevo grupo");
    setMemberIds([]);
    setStep("friends");
    setSavedName(null);
  };

  const openEditWizard = useCallback((group: { id: string; name: string; memberIds: string[] }) => {
    setEditingGroupId(group.id);
    setIsCreatingGroup(true);
    setGroupName(group.name);
    setMemberIds(group.memberIds);
    setStep("friends");
    setSavedName(null);
  }, []);

  // Arriving from a group's "Editar" action (?edit=<id>) opens the wizard prefilled, then
  // clears the param so a refresh doesn't reopen it.
  useEffect(() => {
    if (!hasLoadedGroups || !editParam) return;
    const group = groups.find((item) => item.id === editParam);
    if (!group) return;
    openEditWizard(group);
    router.replace("/groups", { scroll: false });
  }, [editParam, groups, hasLoadedGroups, openEditWizard, router]);

  const handleDeleteGroup = (groupId: string) => {
    setGroups((current) => current.filter((group) => group.id !== groupId));
    if (editingGroupId === groupId) {
      setIsCreatingGroup(false);
      setEditingGroupId(null);
    }
  };

  const handleToggleFriend = (friendId: string) => {
    setMemberIds((current) =>
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId],
    );
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
    setSavedName(newGroup.name);
    window.setTimeout(() => setSavedName(null), 3500);
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
    <PageContainer className="space-y-6 py-8">
      {/* ── Tus grupos ── full-width content; the group cards are the surfaces, so the
          section itself stays chrome-less instead of boxing cards inside another box. */}
      <section>
        {savedName && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <span aria-hidden="true">✓</span>
            <span>«{savedName}» se guardó en este navegador.</span>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                Tus grupos
              </h1>
              <Popover>
                <PopoverTrigger
                  aria-label="¿Para qué sirven los grupos?"
                  className="inline-flex size-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-5" />
                </PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverTitle>¿Para qué sirven los grupos?</PopoverTitle>
                  <PopoverDescription>
                    Selecciona a tus amigos, combina sus restricciones alimentarias y deja que el
                    sistema proponga un restaurante que funcione para todo el grupo.
                  </PopoverDescription>
                </PopoverContent>
              </Popover>
            </div>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Tienes {groups.length} {pluralize(groups.length, "grupo", "grupos")} y puedes abrir
              sus enlaces cuando quieras.
            </p>
          </div>
          <Button onClick={openCreateWizard}>+ Crear grupo</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {presetGroups.map((group) => (
            <Card
              key={group.id}
              className="group relative h-full gap-0 rounded-3xl border border-neutral-200 bg-white py-0 shadow-sm ring-0 transition focus-within:ring-2 focus-within:ring-blue-500/40 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <Link
                href={group.detailHref}
                aria-label={`Entrar a ${group.name}`}
                className="absolute inset-0 z-0 rounded-3xl outline-none"
              />
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

              <CardContent className="flex flex-col gap-4 px-5 pt-4 pb-5">
                <div className="flex flex-wrap gap-2">
                  {group.members.map((friend) => (
                    <span
                      key={friend.id}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
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
                  className="group relative h-full gap-0 rounded-3xl border border-dashed border-neutral-300 bg-white py-0 shadow-sm ring-0 transition focus-within:ring-2 focus-within:ring-blue-500/40 hover:border-neutral-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                >
                  <Link
                    href={group.detailHref}
                    aria-label={`Entrar a ${group.name}`}
                    className="absolute inset-0 z-0 rounded-3xl outline-none"
                  />
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
                    <div className="relative z-10 flex shrink-0 items-center gap-2">
                      <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600">
                        Creado
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Opciones de ${group.name}`}
                          className="inline-flex size-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            strokeWidth={2}
                            className="size-5"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEditWizard(group)}>
                            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pt-4 pb-5">
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((friend) => (
                        <span
                          key={friend.id}
                          className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
                        >
                          <span>{friend.avatar}</span>
                          {friend.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Creation wizard ── */}
      {isCreatingGroup && (
        <section
          ref={wizardRef}
          className="scroll-mt-6 space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
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
                  {editingGroupId ? "Editar grupo" : "Paso 1: añade tus amigos"}
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
                <FriendPicker
                  friends={FRIENDS}
                  selectedIds={memberIds}
                  onToggle={handleToggleFriend}
                />

                {/* Selected friend chips — quick-remove summary of who's in */}
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

                  <InviteLink
                    link={inviteLink}
                    label="Enlace de invitación (ficticio)"
                    hint="Cópialo y compártelo con tu grupo."
                  />
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

                  <FriendPicker
                    friends={FRIENDS}
                    selectedIds={memberIds}
                    onToggle={handleToggleFriend}
                  />
                </CardContent>
              </Card>

              {/* Recommendation result — shown directly; it updates as you add or remove
                  friends, so there's no separate "generate" tap to gate it. */}
              <Card className="gap-0 rounded-3xl border border-neutral-200 bg-white py-0 shadow-sm ring-0 dark:border-neutral-800 dark:bg-neutral-900">
                <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Recomendación del grupo
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {canRecommend
                          ? `${compatibleRestaurants.length} ${pluralize(
                              compatibleRestaurants.length,
                              "restaurante compatible",
                              "restaurantes compatibles",
                            )}.`
                          : "Añade amigos para cruzar sus restricciones."}
                      </p>
                    </div>
                    {canRecommend && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Priorizado por rating y volumen de reseñas.
                      </p>
                    )}
                  </div>

                  {!canRecommend ? (
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-950">
                      <p className="text-base font-medium text-neutral-900 dark:text-white">
                        Agrega al menos un amigo para ver la recomendación.
                      </p>
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        En cuanto sumes a alguien, aquí aparecerá el restaurante que funciona para
                        todo el grupo.
                      </p>
                    </div>
                  ) : recommendedRestaurant ? (
                    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
                      <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                        <Image
                          src={getCuisineImage(
                            recommendedRestaurant.cuisine,
                            recommendedRestaurant.id,
                          )}
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
                            Por qué funciona para el grupo
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            Cumple con todas las restricciones combinadas del grupo:{" "}
                            {activeDietaryTags.join(", ")}.
                          </p>
                        </div>

                        {compatibleRestaurants.length > 1 && (
                          <div className="mt-6">
                            <CompatibleRestaurants
                              restaurants={compatibleRestaurants.slice(1)}
                              title="Otras opciones para el grupo"
                            />
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
                <Button onClick={handleSaveGroup} size="lg">
                  {editingGroupId ? "Guardar cambios" : "Guardar grupo"}
                </Button>
              </div>
            </section>
          )}
        </section>
      )}
    </PageContainer>
  );
}

export default function GroupsClient() {
  return (
    <Suspense
      fallback={
        <PageContainer className="py-8 text-sm text-neutral-500">Cargando grupos...</PageContainer>
      }
    >
      <GroupsContent />
    </Suspense>
  );
}
