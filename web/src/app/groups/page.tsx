"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FRIENDS, MOCK_GROUPS, MOCK_RESTAURANTS } from "@/lib/constants";
import { recommendGroupRestaurants } from "@/lib/group-recommendations";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { cn, pluralize } from "@/lib/utils";
import { getCuisineImage } from "@/lib/cuisine-images";

const STORAGE_KEY = "restaurapp-group-state";
const GROUPS_STORAGE_KEY = "restaurapp-groups-state";
const DEFAULT_GROUP_NAME = "Cena entre amigos";
const DEFAULT_MEMBER_IDS = FRIENDS.map((friend) => friend.id);

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
    .replace(/[\u0300-\u036f]/g, "")
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
        const validIds = parsed.memberIds.filter((id) => FRIENDS.some((friend) => friend.id === id));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ groupName, memberIds } satisfies StoredGroupState));
  }, [groupName, hasHydrated, memberIds]);

  useEffect(() => {
    if (!hasLoadedGroups) return;

    const persistedGroups = groups.filter((group) => !MOCK_GROUPS.some((preset) => preset.id === group.id));
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(persistedGroups));
  }, [groups, hasLoadedGroups]);

  const selectedFriends = useMemo(
    () => FRIENDS.filter((friend) => memberIds.includes(friend.id)),
    [memberIds]
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
    [selectedFriends]
  );

  const inviteLink = useMemo(
    () => buildInviteLink(groupName, memberIds),
    [groupName, memberIds]
  );

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
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId]
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
        return current.map((group) => (group.id === editingGroupId ? { ...group, ...newGroup } : group));
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
    []
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
    [groups]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-neutral-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(250,250,250,0.98))] p-6 shadow-sm dark:border-neutral-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_rgba(17,24,39,0.96),_rgba(9,9,11,0.98))]">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Grupos de amigos
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Crea un grupo y encuentra un restaurante compatible con todos.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base">
            Selecciona a tus amigos, combina sus restricciones alimentarias y deja que el sistema proponga un lugar que funcione para todo el grupo.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Tus grupos</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Ya tienes {presetGroups.length} grupos creados y puedes abrir sus enlaces cuando quieras.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {presetGroups.map((group) => (
              <article key={group.id} className="flex h-full flex-col rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{group.name}</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      Creado el {new Date(group.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950">
                    {group.members.length} {pluralize(group.members.length, "amigo", "amigos")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {group.members.map((friend) => (
                    <span key={friend.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-800">
                      <span>{friend.avatar}</span>
                      {friend.name}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Array.from(new Set(group.members.flatMap((friend) => friend.dietaryTags))).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={group.detailHref}
                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    Entrar al grupo
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {sessionGroups.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                Grupos creados en esta sesión
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {sessionGroups.map((group) => (
                  <article key={group.id} className="flex h-full flex-col rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-950">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{group.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {group.members.length} {pluralize(group.members.length, "amigo", "amigos")} dentro
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        Creado
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.members.map((friend) => (
                        <span key={friend.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-neutral-700 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-800">
                          <span>{friend.avatar}</span>
                          {friend.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Link
                        href={group.detailHref}
                        className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        Entrar al grupo
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={openCreateWizard}
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              + Crear nuevo grupo
            </button>
          </div>
        </section>

        {isCreatingGroup && (
          <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                <span className={cn("rounded-full px-3 py-1", step === "friends" ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>1. Amigos</span>
                <span className={cn("rounded-full px-3 py-1", step === "recommendation" ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800")}>2. Recomendación</span>
              </div>
              <div className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                Se guarda en este navegador
              </div>
            </div>

            {step === "friends" ? (
              <section className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Paso 1: añade tus amigos</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Puedes dejar el grupo vacío si solo quieres compartir el enlace después.
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-300">Nombre del grupo</span>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    placeholder="Ej. Cena del viernes"
                  />
                </label>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-300">Buscar amigos</span>
                    <input
                      type="text"
                      value={friendSearch}
                      onChange={(event) => setFriendSearch(event.target.value)}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                      placeholder="Escribe un nombre o una dieta"
                    />
                  </label>

                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                    <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
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
                                selected && "bg-blue-50 dark:bg-blue-500/10"
                              )}
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                                {friend.avatar}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{friend.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                      {friend.dietaryTags.length} {pluralize(friend.dietaryTags.length, "restricción", "restricciones")}
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                      selected
                                        ? "bg-blue-600 text-white"
                                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
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
                        <p className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">No hay amigos que coincidan con esa búsqueda.</p>
                      )}
                    </div>
                  </div>

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
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Todavía no has añadido amigos al grupo.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("recommendation")}
                    className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    Continuar con este grupo
                  </button>
                </div>
              </section>
            ) : (
              <section className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">Paso 2: recomendación</p>
                    <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-white">{groupName || DEFAULT_GROUP_NAME}</h2>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      El sistema cruza las restricciones de todos los miembros y prioriza la mejor opción por rating y reseñas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("friends")}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    Volver
                  </button>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-950">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">Miembros del grupo</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFriends.length > 0 ? (
                      selectedFriends.map((friend) => (
                        <span key={friend.id} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-neutral-950">
                          <span>{friend.avatar}</span>
                          {friend.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Todavía no hay amigos dentro del grupo.</p>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Enlace ficticio</p>
                    <p className="mt-2 break-all text-sm text-neutral-500 dark:text-neutral-400">{inviteLink}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        {copied ? "Enlace copiado" : "Copiar enlace"}
                      </button>
                      <Link
                        href={inviteLink}
                        className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        Entrar al grupo
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">Agregar amigos</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Puedes sumar o quitar personas antes de recomendar.
                      </p>
                    </div>
                    <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                      {selectedFriends.length} dentro
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
                          )}
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
                              {friend.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{friend.name}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {friend.dietaryTags.length} {pluralize(friend.dietaryTags.length, "restricción", "restricciones")}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                              )}
                            >
                              {selected ? "Quitar" : "Agregar"}
                            </span>
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
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRecommendation(true)}
                    disabled={!canRecommend}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    🍽️ Recomendar restaurante
                  </button>

                  {!canRecommend && (
                    <p className="text-center text-sm text-amber-700 dark:text-amber-300">
                      Agrega al menos un amigo para habilitar la recomendación.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Recomendación del grupo</h2>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {compatibleRestaurants.length} {pluralize(compatibleRestaurants.length, "restaurante", "restaurantes")} compatible{compatibleRestaurants.length === 1 ? "" : "s"}.
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
                        Cuando pulses el botón de arriba, aquí aparecerá el restaurante recomendado para el grupo.
                      </p>
                    </div>
                  ) : recommendedRestaurant ? (
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
                              {recommendedRestaurant.cuisine} · {recommendedRestaurant.priceRange} · {recommendedRestaurant.address}
                            </p>
                          </div>
                          <Rating value={recommendedRestaurant.rating} reviewCount={recommendedRestaurant.reviewCount} />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {recommendedRestaurant.dietaryTags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-950">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">Por qué funciona para el grupo</p>
                          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            Cumple con todas las restricciones combinadas del grupo: {activeDietaryTags.join(", ")}.
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <Link
                            href={`/restaurants/${recommendedRestaurant.id}`}
                            className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                          >
                            Ver restaurante
                          </Link>
                          <div className="inline-flex items-center rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-300">
                            {compatibleRestaurants.length} opción{compatibleRestaurants.length === 1 ? "" : "es"} compatible{compatibleRestaurants.length === 1 ? "" : "s"}
                          </div>
                        </div>

                        {compatibleRestaurants.length > 1 && (
                          <div className="mt-6">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Alternativas compatibles</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {compatibleRestaurants.slice(1, 3).map((restaurant) => (
                                <div
                                  key={restaurant.id}
                                  className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-neutral-900 dark:text-white">{restaurant.name}</p>
                                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {restaurant.cuisine} · {restaurant.priceRange}
                                      </p>
                                    </div>
                                    <span className="text-sm font-semibold text-yellow-500">★ {restaurant.rating.toFixed(1)}</span>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {restaurant.dietaryTags.map((tag) => (
                                      <Badge key={tag} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <p className="text-base font-medium text-amber-900 dark:text-amber-200">No encontramos un restaurante que cumpla con todas las dietas del grupo.</p>
                      <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-100/80">
                        Prueba quitando un amigo o cambiando la composición del grupo para abrir más opciones.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveGroup}
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Guardar grupo
                  </button>
                </div>
              </section>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
