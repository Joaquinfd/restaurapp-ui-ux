"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, FavouriteIcon, UndoIcon } from "@hugeicons/core-free-icons";
import type { Restaurant } from "@/types";
import type { SwipeVote } from "@/lib/group-match";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SwipeCard } from "./swipe-card";

/** Drag distance (px) past which releasing commits a vote. */
const SWIPE_THRESHOLD = 110;
/** Movement (px) before we lock a gesture into horizontal (vote) or vertical (scroll). */
const AXIS_LOCK = 8;
const EXIT_MS = 240;

interface SwipeDeckProps {
  deck: Restaurant[];
  onVote: (restaurantId: string, vote: SwipeVote) => void;
  /** Clears the vote of the restaurant we step back to, so it can be re-evaluated. */
  onUndo: (restaurantId: string) => void;
  onComplete: () => void;
}

export function SwipeDeck({ deck, onVote, onUndo, onComplete }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState<SwipeVote | null>(null);

  const startRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  // Per-gesture lock: null until we know the intent, then horizontal (vote) or
  // vertical (let the card scroll natively).
  const axisRef = useRef<null | "x" | "y">(null);

  // Lazy-initialized so we never touch `window` during SSR or read a ref in render.
  // Neither value affects the initial (drag=0, exit=null) transform, so no hydration drift.
  const [viewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth || 500 : 500,
  );
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const current = deck[index];

  const advance = useCallback(() => {
    const next = index + 1;
    setDrag({ x: 0, y: 0 });
    setExit(null);
    setIndex(next);
    // Notify the parent *after* scheduling our own update — never inside the
    // setIndex updater, which runs during render.
    if (next >= deck.length) onComplete();
  }, [deck.length, index, onComplete]);

  const commit = useCallback(
    (vote: SwipeVote) => {
      if (!current || exit) return;
      onVote(current.id, vote);
      if (reducedMotion) {
        advance();
        return;
      }
      setDragging(false);
      setExit(vote);
      window.setTimeout(advance, EXIT_MS);
    },
    [advance, current, exit, onVote, reducedMotion],
  );

  const canUndo = index > 0 && !exit;

  const undo = useCallback(() => {
    if (index === 0 || exit) return;
    const previous = index - 1;
    onUndo(deck[previous].id);
    setDrag({ x: 0, y: 0 });
    setExit(null);
    setIndex(previous);
  }, [deck, exit, index, onUndo]);

  // Keyboard controls: ← pass, → like, ↓ go back.
  useEffect(() => {
    if (!current) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        commit("like");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        commit("nope");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, current, undo]);

  const resetGesture = () => {
    pointerIdRef.current = null;
    axisRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (exit || event.button !== 0) return;
    startRef.current = { x: event.clientX, y: event.clientY };
    pointerIdRef.current = event.pointerId;
    axisRef.current = null;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (exit || pointerIdRef.current !== event.pointerId) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;

    if (axisRef.current === null) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal intent → take over for a vote and stop the card scrolling.
        axisRef.current = "x";
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        // Vertical intent → let the card scroll natively; we stay out of the way.
        axisRef.current = "y";
        return;
      }
    }

    if (axisRef.current === "x") {
      setDrag({ x: dx, y: dy });
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (axisRef.current === "x" && dragging) {
      setDragging(false);
      if (drag.x > SWIPE_THRESHOLD) commit("like");
      else if (drag.x < -SWIPE_THRESHOLD) commit("nope");
      else setDrag({ x: 0, y: 0 });
    }
    resetGesture();
  };

  const handlePointerCancel = (event: React.PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (dragging) {
      setDragging(false);
      setDrag({ x: 0, y: 0 });
    }
    resetGesture();
  };

  if (!current) return null;

  const exitX = exit === "like" ? viewportWidth * 1.4 : -viewportWidth * 1.4;
  const translateX = exit ? exitX : drag.x;
  const translateY = exit ? -40 : drag.y;
  const rotate = exit ? (exit === "like" ? 18 : -18) : drag.x * 0.04;
  const stampDrag = exit === "like" ? 120 : exit === "nope" ? -120 : drag.x;
  const likeStamp = Math.min(1, Math.max(0, stampDrag / 90));
  const nopeStamp = Math.min(1, Math.max(0, -stampDrag / 90));

  // A single "heads up" card sits directly behind the active one — centered with no
  // offset, so it never shifts position when promoted — and rises to full size as you
  // swipe, so the transition into the next card reads as smooth depth, not a jump.
  const nextCard = deck[index + 1];
  const peekProgress = exit ? 1 : Math.min(1, Math.abs(drag.x) / SWIPE_THRESHOLD);
  const peekScale = 0.96 + peekProgress * 0.04;
  const peekOpacity = 0.6 + peekProgress * 0.4;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {/* Progress + go back */}
      <div className="flex shrink-0 items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo}
          aria-label="Volver al anterior"
          className="rounded-full border-amber-200 bg-white text-amber-500 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-40 dark:border-amber-900/60 dark:bg-neutral-900 dark:hover:bg-amber-950/40"
        >
          <HugeiconsIcon icon={UndoIcon} strokeWidth={2.5} className="size-4" />
        </Button>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
            <span>
              {Math.min(index + 1, deck.length)} de {deck.length}
            </span>
            <span>{deck.length - index} por revisar</span>
          </div>
          <Progress value={index} max={deck.length} />
        </div>
      </div>

      {/* Card stack — fills the remaining height */}
      <div className="relative mx-auto min-h-0 w-full max-w-96 flex-1">
        {/* Next card (heads up) — directly behind, centered, rises as you swipe */}
        {nextCard && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              transform: `scale(${peekScale})`,
              opacity: peekOpacity,
              transition: dragging
                ? "none"
                : `transform ${EXIT_MS}ms ease-out, opacity ${EXIT_MS}ms ease-out`,
              zIndex: 0,
            }}
          >
            <SwipeCard restaurant={nextCard} isBackground />
          </div>
        )}

        {/* Active card. `key` remounts the wrapper when the restaurant changes, so the
          next card mounts fresh at center (no transition) instead of the just-swiped
          card appearing to slide back in. It also resets the inner scroll/gallery. */}
        <div
          key={current.id}
          className="absolute inset-0 z-10 [touch-action:pan-y]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
            transition: dragging ? "none" : `transform ${EXIT_MS}ms ease-out`,
          }}
        >
          <SwipeCard restaurant={current} />

          {/* Drag stamps — pinned over the card, independent of inner scroll */}
          <span
            aria-hidden="true"
            style={{ opacity: likeStamp }}
            className="pointer-events-none absolute top-8 left-6 -rotate-12 rounded-xl border-4 border-emerald-500 px-3 py-1 text-2xl font-black tracking-wide text-emerald-500 uppercase"
          >
            Me gusta
          </span>
          <span
            aria-hidden="true"
            style={{ opacity: nopeStamp }}
            className="pointer-events-none absolute top-8 right-6 rotate-12 rounded-xl border-4 border-red-500 px-3 py-1 text-2xl font-black tracking-wide text-red-500 uppercase"
          >
            Paso
          </span>
        </div>

        {/* Floating action buttons — overlay the card, outside the swipe transform so
            they stay put while the card flies off */}
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6">
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => commit("nope")}
            aria-label="Paso"
            className="size-16 rounded-full border-red-200 bg-white text-red-500 shadow-lg hover:border-red-300 hover:bg-red-50 dark:border-red-900/60 dark:bg-neutral-900 dark:hover:bg-red-950/40"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.5} className="size-7" />
          </Button>

          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => commit("like")}
            aria-label="Me gusta"
            className="size-16 rounded-full border-emerald-200 bg-white text-emerald-600 shadow-lg hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-neutral-900 dark:hover:bg-emerald-950/40"
          >
            <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2.5} className="size-7" />
          </Button>
        </div>
      </div>
    </div>
  );
}
