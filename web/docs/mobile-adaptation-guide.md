# Mobile adaptation — rebuild guide

A plan to redo the mobile adaptation from a clean baseline, fixing the two
problems with the previous attempt:

1. The bottom app bar **didn't let you reach all features** (Búsqueda guiada,
   Grupos, Perfil were buried behind a generic "Más" drawer; the whole
   `/manager` section was reachable from nowhere).
2. The **home tab wasn't fully responsive**.

It also keeps the genuinely good pieces from the previous attempt so you don't
rebuild them from zero.

---

## 0. Reset to a clean baseline

> ⚠️ `git reset --hard` only reverts **tracked** files. The previous mobile work
> added 6 **untracked** files that a hard reset will leave behind. You must also
> run `git clean` or you'll rebuild on top of half-deleted scaffolding.

```bash
cd web

# See exactly what will be deleted first (dry run — deletes nothing):
git clean -nd

# Then revert tracked changes AND remove untracked files:
git reset --hard HEAD
git clean -fd
```

After this you are back at commit `3963fd4`. Confirm with `git status` (should be
clean) and note the starting state:

- `src/app/layout.tsx` renders only `<Sidebar />` (which is `hidden lg:flex`).
  **There is no mobile navigation at all below `lg` (1024px).** That is the gap
  this guide fills.
- `src/lib/constants.ts` → `NAV_LINKS` has 7 routes:
  `/`, `/restaurants`, `/map`, `/search`, `/groups`, `/favorites`, `/profile`.
- `/manager`, `/manager/new`, `/manager/[id]` exist but are **not** in
  `NAV_LINKS`.
- `src/components/layout/navbar.tsx` and `mobile-nav.tsx` are orphaned (not
  imported by `layout.tsx`). Delete them as part of this work — they're dead code.

---

## 1. The core fix: bottom navigation with no "More" drawer

### Why the previous bar was wrong

The previous `bottom-tab-bar.tsx` showed 4 primary tabs (`/`, `/restaurants`,
`/map`, `/favorites`) and pushed everything else into a **"Más" overflow
drawer**. Problems:

- A generic "More" bucket is a known mobile anti-pattern: it hides destinations
  the user can't predict, and turns a 1-tap action into tap → read list → tap.
- It buried **Búsqueda guiada** (a flagship feature) and **Perfil** (which users
  expect to always be one tap away).
- **`/manager` wasn't anywhere** — not in the bar, not in the drawer, not in the
  sidebar.

### The principle

A bottom bar should hold **3–5 fixed, top-level destinations, all equally
important, with no overflow.** Anything that doesn't earn a permanent slot
becomes a sub-destination reached from one of those 5 (most commonly from
**Perfil**, used as a hub).

### Recommended tab set (5, no overflow)

| Slot | Route          | Label        | Notes                                        |
| ---- | -------------- | ------------ | -------------------------------------------- |
| 1    | `/`            | Inicio       | Home / discovery                             |
| 2    | `/restaurants` | Restaurantes | Primary browse                               |
| 3    | `/map`         | Mapa         | Map browse                                   |
| 4    | `/favorites`   | Favoritos    | Saved                                        |
| 5    | `/profile`     | Perfil       | **Hub** for Grupos, Búsqueda guiada, Manager |

This makes **every** feature reachable in ≤ 2 taps with nothing hidden behind a
nondescript "More":

- **Búsqueda guiada** → also surfaced directly on Inicio (the search bar is
  already there) **and** listed in Perfil.
- **Grupos** → listed in Perfil.
- **Manager** → listed in Perfil (gated to manager users if/when you add roles).

> If guided search is more central to your product than the favorites list, swap
> slot 4 → `/search` and move Favoritos into the Perfil hub. The point is: pick
> the 5 that matter and commit to them — don't add a 6th "Más" tab.

### Make `NAV_LINKS` express this structure

Right now `NAV_LINKS` is a flat list of 7. Give each entry a role so the sidebar,
the bottom bar, and the Perfil hub can all read from one source of truth instead
of hard-coding hrefs in `bottom-tab-bar.tsx`.

```ts
// src/lib/constants.ts
export const NAV_LINKS = [
  { href: "/", label: "Inicio", primary: true },
  { href: "/restaurants", label: "Restaurantes", primary: true },
  { href: "/map", label: "Mapa", primary: true },
  { href: "/favorites", label: "Favoritos", primary: true },
  { href: "/profile", label: "Perfil", primary: true },
  // Secondary: not in the bottom bar, surfaced inside Perfil.
  { href: "/search", label: "Búsqueda guiada", primary: false },
  { href: "/groups", label: "Grupos", primary: false },
  { href: "/manager", label: "Gestionar restaurantes", primary: false },
] as const;

export const PRIMARY_NAV_LINKS = NAV_LINKS.filter((l) => l.primary);
export const SECONDARY_NAV_LINKS = NAV_LINKS.filter((l) => !l.primary);
```

The desktop `Sidebar` can keep rendering **all** of `NAV_LINKS` (it has the
vertical room). The bottom bar renders only `PRIMARY_NAV_LINKS`.

### Active state must handle nested routes

The previous bar used `pathname === link.href`, so on `/restaurants/123` **no tab
looked active**. Use a prefix match (with `/` special-cased):

```ts
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
```

### `bottom-tab-bar.tsx` (rebuilt — no drawer)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAV_ICONS } from "./nav-icons";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-950/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-stretch">
        {PRIMARY_NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // min-h-12 keeps the tap target ≥ 48px (accessibility).
                  "flex h-full min-h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
                  active
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400",
                )}
              >
                <span aria-hidden>{NAV_ICONS[link.href]}</span>
                <span className="truncate px-1">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

No `useState`, no `Drawer`, no overflow logic — fewer moving parts is exactly why
it stops "not working well."

### Perfil becomes the hub for secondary destinations

On `/profile`, render a section that lists `SECONDARY_NAV_LINKS` as a simple
list (Búsqueda guiada, Grupos, Gestionar restaurantes) plus the theme toggle.
This is the conventional "profile tab = account + everything-else hub" pattern.
It replaces what the "Más" drawer was doing, but in a predictable, labelled
place.

```tsx
// inside the profile page/client, mobile-only block (lg:hidden)
<section className="lg:hidden">
  <h2 className="mb-2 text-sm font-semibold text-neutral-500">Más</h2>
  <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
    {SECONDARY_NAV_LINKS.map((link) => (
      <li key={link.href}>
        <Link href={link.href} className="flex items-center gap-3 py-3">
          {NAV_ICONS[link.href]} {link.label}
        </Link>
      </li>
    ))}
  </ul>
</section>
```

---

## 2. Wire it into the layout

```tsx
// src/app/layout.tsx
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";

// ...inside <SidebarProvider>:
<Sidebar />
<MainWrapper>
  <main className="flex-1">{children}</main>
  <Footer />
</MainWrapper>
<BottomTabBar />
<CompareBar />
```

Add the `viewport` export so `env(safe-area-inset-*)` returns real notch/home-bar
insets (otherwise it resolves to 0 and the bar sits under the iOS home
indicator):

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // required for safe-area insets
};
```

**`main-wrapper.tsx`** must reserve space so the fixed bar never covers page
content. Map is full-bleed and manages its own spacing, so exclude it:

```tsx
const isMap = pathname === "/map";
className={cn(
  "flex min-h-full flex-1 flex-col transition-all duration-300",
  collapsed ? "lg:pl-18" : "lg:pl-60",
  !isMap && "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0",
)}
```

`CompareBar` (the floating compare bar) must also sit **above** the tab bar on
mobile — give it `bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-6`
so the two don't overlap. This overlap was another "not working well" symptom.

---

## 3. Keep these pieces from the previous attempt

They were well-built — recreate them as-is rather than reinventing:

- **`src/components/layout/nav-icons.tsx`** — one icon set keyed by href, shared
  by the sidebar and bottom bar. Add an icon for `/manager`.
- **`src/hooks/use-is-mobile.ts`** — SSR-safe `matchMedia("(max-width: 1023px)")`
  hook. Use **only** for interaction swaps that CSS can't express (bottom sheet
  vs centered modal), not for layout — layout stays in `lg:` classes.
- **`src/components/ui/responsive-modal.tsx`** — renders a bottom `Drawer` on
  mobile and a centered modal on desktop. Use it for Quick Menu / rating / etc.
- **`src/components/layout/mobile-top-bar.tsx`** — slim per-page sticky header
  (`lg:hidden`) for title + actions (search, filters). Pages opt in.
- **`src/components/filters/filter-sheet.tsx`** — filters in a bottom sheet on
  mobile instead of an inline bar.

---

## 4. Home tab responsiveness

`home-client.tsx` is mostly responsive (hero text already scales
`text-3xl sm:text-4xl lg:text-5xl`). The remaining polish:

### 4.1 Category chips — hide scrollbar + add snap

`category-filter.tsx` uses `flex gap-2 overflow-x-auto pb-2`. It scrolls, but
shows an ugly scrollbar on desktop/Windows and doesn't snap. Improve:

```tsx
<div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  {/* each <Button className="shrink-0 snap-start"> */}
```

Add a small left/right edge fade (optional) with a wrapping element using a
mask-image so chips look like they continue off-screen.

### 4.2 Restaurant grid — tighten gap on mobile

`restaurant-list.tsx` uses `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`. One column
on mobile is right, but `gap-6` (24px) is large for a single column. Use a
responsive gap:

```tsx
<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
```

### 4.3 Section spacing on mobile

The home sections use fixed `mb-8` / `mb-10` / `mb-12`. Scale them down on small
screens so the page isn't overly tall on a phone:

```tsx
<section className="mb-6 text-center sm:mb-10 lg:mb-12"> {/* hero */}
<section className="mb-8 sm:mb-10">                      {/* categorías */}
```

### 4.4 Hero search width

`SearchBar` is full-width inside `max-w-xl mx-auto` — good. Just confirm the
input height is comfortable for touch (≥ 44px); bump the `Input` height on mobile
if needed (`h-11 sm:h-10`).

### 4.5 Per-page mobile header (optional but recommended)

Home currently relies on the in-page hero as its header. For `/restaurants`,
`/groups`, `/favorites`, etc., add `<MobileTopBar title="…" actions={…} />` so
each page has a consistent sticky title + search/filter affordance on mobile,
matching the bottom bar.

---

## 5. Verification checklist

Run the dev server from `web/`: `pnpm dev`, then in DevTools device mode
(iPhone + a small Android) check:

- [ ] Bottom bar shows exactly the 5 primary tabs, no "Más".
- [ ] Every feature reachable in ≤ 2 taps (Búsqueda guiada, Grupos, Manager via
      Perfil).
- [ ] On `/restaurants/123` the **Restaurantes** tab is highlighted (nested-route
      active state).
- [ ] Bottom bar clears the iOS home indicator (safe-area padding visible).
- [ ] Page content is never hidden behind the bar (scroll to the very bottom of
      a long list).
- [ ] `CompareBar` floats above the tab bar, not under it.
- [ ] `/map` is full-bleed with no double bottom gap.
- [ ] Category chips scroll horizontally with no visible scrollbar; cards are
      single-column with comfortable spacing.
- [ ] Sidebar still correct at `lg+` and the bottom bar is hidden there.
- [ ] `pnpm check` passes (lint + format + typecheck).

---

## 6. Suggested commit sequence

Keep formatting noise out of the feature diff:

1. `style: apply prettier formatting` — if you re-run `pnpm format`, commit it
   alone first (this is the semicolon churn you saw across ~60 files).
2. `feat(nav): mobile bottom tab bar + nav roles in NAV_LINKS`
3. `feat(profile): secondary-destinations hub on mobile`
4. `fix(layout): safe-area padding, compare-bar offset above tab bar`
5. `refactor(home): responsive category scroll, grid gap, spacing`
6. `chore: remove dead navbar.tsx / mobile-nav.tsx`
