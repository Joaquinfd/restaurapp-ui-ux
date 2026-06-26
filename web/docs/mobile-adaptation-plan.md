# Mobile adaptation plan (iteration 2)

Adapts every view to mobile **without changing the desktop (`lg+`) look at all**,
following the same approach as the last iteration. Skills used:
`mobile-app-ui-design` (mobile UX/UI rules — 8-pt grid, thumb zone, tap targets,
≤4 type sizes) and `frontend-design` (keep the desktop visual identity intact,
intentional typography).

This builds on the responsiveness fix already shipped (the `min-w-0` +
`overflow-x-clip` overflow fix in `main-wrapper.tsx` / `layout.tsx` that stopped
the "zoomed in / cropped" bug). That removed the blocker; this plan is the polish
pass on top.

---

## The golden rule (how we protect desktop)

Tailwind is **mobile-first**: an unprefixed class applies at every width; `sm:`
(≥640px) and `lg:` (≥1024px) override upward. Therefore:

> **Only ever touch unprefixed (base) and `sm:` utilities. Never modify a `lg:`
> class.** At `lg+` the value resolves to the existing `lg:`/`sm:` class, so the
> desktop render is mathematically unchanged.

When a value needs to differ on mobile but the current class is unprefixed (so it
also styles desktop), the move is: pin the current value at `sm:` and add the
smaller value unprefixed. Example: `py-8` → `py-6 sm:py-8` (desktop still 8).

Verification (below) screenshots `lg` before/after and asserts pixel-identical.

---

## 0. Tooling: add a headless browser (Playwright)

A headless browser is Chromium/Firefox/WebKit with no visible window, driven by
a script. We need it because mobile bugs (overflow, cramped grids, tiny tap
targets) are **visual** — they can't be caught by `tsc`/`eslint`, and I can't
eyeball them from the terminal. Right now this repo has none, so every mobile
change is unverified until a human opens DevTools.

### What it lets us do

1. **Screenshots at real viewports** — render any route at 375×812 (iPhone SE/12
   mini) and 1440×900 (desktop) and save PNGs to compare.
2. **Assert no horizontal overflow** — the exact bug from this session, caught
   automatically: `document.documentElement.scrollWidth <= window.innerWidth`.
3. **Desktop regression guard** — screenshot `lg` before and after a change and
   diff them; the plan's "don't touch desktop" promise becomes a test, not a hope.
4. **Tap-target audit** — query every button/link and flag any with rendered
   box < 44×44 px.
5. (Later) end-to-end interaction tests — open the filter sheet, submit a form, etc.

### Install

```bash
cd web
pnpm add -D @playwright/test
pnpm exec playwright install chromium   # downloads the browser binary (~150MB, one time)
```

Add to `package.json` scripts:

```json
"test:e2e": "playwright test",
"shots": "playwright test tests/screenshots.spec.ts"
```

### Minimal overflow + screenshot spec (`web/tests/responsive.spec.ts`)

```ts
import { test, expect, devices } from "@playwright/test";

const ROUTES = ["/", "/restaurants", "/favorites", "/profile", "/search",
  "/groups", "/map", "/manager", "/restaurants/1"];

for (const route of ROUTES) {
  test(`no horizontal overflow on ${route} (mobile)`, async ({ browser }) => {
    const ctx = await browser.newContext({ ...devices["iPhone SE"] });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3000${route}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, "page must not be wider than the viewport").toBeLessThanOrEqual(0);
    await page.screenshot({ path: `shots/mobile${route.replace(/\//g, "_")}.png`, fullPage: true });
    await ctx.close();
  });
}
```

Run `pnpm dev` in one terminal, `pnpm shots` in another. The PNGs in `web/shots/`
are the before/after evidence for each view. (Add `web/shots/` to `.gitignore`.)

> Note: this is a **dev dependency** — it never ships to the Netlify build, so it
> can't affect the deploy.

---

## Findings — mobile design improvement opportunities

Grouped by type. "Touch" = which breakpoints we'd edit (always base/`sm:` only).

### A. Typography (no system + non-responsive titles)

| # | Finding | Where | Fix direction |
|---|---------|-------|---------------|
| A1 | Page titles have **no consistent scale** — they range `text-2xl`→`text-4xl` with no rule | restaurants `text-3xl`, search `text-3xl`, groups `text-3xl sm:text-4xl`, manager `text-2xl`, forms `text-2xl`, detail `text-3xl` | Define one page-title token: `text-2xl sm:text-3xl` (and reserve `text-4xl` only for the home hero). |
| A2 | Several titles are **fixed (non-responsive)** so they don't shrink on a 375px phone | restaurants, search, group-detail, restaurant-detail (`text-3xl`) | Make each `text-2xl sm:text-3xl`. Desktop (`sm:`) stays 3xl = unchanged. |
| A3 | Skill says **≤4 sizes / ≤2 weights**; the app uses ~7 text sizes freely | app-wide | Document a scale (display / title / body / caption) in a comment block and map components to it over time. |
| A4 | A few micro-labels at `text-xs`/`text-[11px]` risk legibility on mobile | detail `locationDetail`, badges | Floor body text at `text-sm` on mobile where it's primary content. |

### B. Element sizing & tap targets (skill: min 44×44px)

| # | Finding | Where | Fix direction |
|---|---------|-------|---------------|
| B1 | **Filter bar** is a dense wrapped cluster of `size="xs"` buttons (Precio/Rating/Dieta) — each well under 44px and visually noisy on a phone | `components/filters/filter-bar.tsx` (used on `/restaurants`) | On mobile, collapse filters into a **bottom-sheet** ("Filtros" trigger button → drawer with comfortably sized controls). Keep the inline bar at `lg:`. (Rebuild the `filter-sheet.tsx` the previous iteration had.) |
| B2 | **Compare modal** uses `grid-cols-2`/`grid-cols-3` with **no responsive prefix** → 2–3 restaurant columns side-by-side on a phone = unreadable | `components/compare/compare-modal.tsx` | Mobile: switch to a single horizontally-scrolled column-per-restaurant or stacked attribute rows; keep the columns grid at `sm:`/`lg:`. |
| B3 | Icon-only buttons render ~32px | card compare toggle (`p-2`), theme toggle, card "Ver menú" | Add `min-h-11 min-w-11` (or `p-2.5`) on mobile; desktop can stay compact via `lg:`. |
| B4 | Profile section tab strip: `text-xs py-2` (~32px) | `profile-client.tsx` mobile nav | Bump to `py-2.5` and ensure horizontal scroll has momentum; acceptable as a strip but enlarge targets. |
| B5 | Form inputs/`INPUT_CLASS` use `py-2` (~36px) | profile, forms | `py-2.5` on mobile for 44px touch height. |

### C. Per-view layout

| # | View | Finding | Fix direction |
|---|------|---------|---------------|
| C1 | **/restaurants** | Filter bar density (B1); search + title row already stacks fine | Filter sheet; title token (A2). |
| C2 | **/restaurants/[id]** (detail) | Grid stacks correctly (`lg:grid-cols-3`); but title fixed `text-3xl`, and the favorite / rating CTAs sit mid-page, not in the thumb zone | A2 on title; consider a **sticky bottom action bar** (♥ Favorito + Calificar) on mobile per thumb-zone rule. |
| C3 | **/search** (guided-search) | Option grids are `grid-cols-2 sm:grid-cols-4` (OK); title fixed `text-3xl` | A2; verify large emoji tiles aren't oversized on mobile. |
| C4 | **/groups** + group detail | Big screens; grids are `md:grid-cols-2` (stack OK); several modals | Audit modals/dialogs at 375px (width, padding, button rows); title tokens. |
| C5 | **/manager** dashboard + forms | Multi-tab create/edit forms are dense; fields collapse to 1 col (good) but **Save** isn't sticky/thumb-zone and the tab strip can overflow | Sticky save bar on mobile; make tab strip a scrollable segmented control; title tokens. |
| C6 | **/map** | Already has a mobile bottom-sheet (added in `fix(layout): rm default zoom…`) | Verify sheet height, drag, and that the map fills correctly at 375px. |
| C7 | **/profile** | Spacing pass already partly done this session | Finish: input heights (B5), tab targets (B4). |

### D. Navigation (current state)

- Today mobile nav = a hamburger in the `MainWrapper` top bar that opens the
  `Sidebar` as a drawer (`mobileOpen` in `sidebar-context`). Verify it (a) opens/
  closes, (b) traps focus, (c) lists **all** destinations — note `NAV_LINKS` still
  omits `/manager`, so the manager area is unreachable from nav (same gap flagged
  last iteration).
- **Decision point:** keep the hamburger-drawer, or move to a bottom tab bar
  (thumb-zone, the previous iteration's idea). Bottom tabs test better on phones
  for a browse-heavy app; the drawer is less code. Pick one before Phase 2.

---

## Phased plan

### Phase 0 — Tooling & baseline (no UI change)
- Add Playwright (section 0); commit the overflow spec; capture **baseline desktop
  screenshots** of all routes at 1440px to diff against later.
- Add `web/shots/` to `.gitignore`.

### Phase 1 — Typography system (A1–A4)
- Add a short type-scale comment block (the 4 roles) somewhere central (e.g. top of
  `globals.css`).
- Sweep page titles to the `text-2xl sm:text-3xl` token (A2) — restaurants, search,
  group-detail, restaurant-detail, manager, forms. Pure base/`sm:` edits.
- Run Playwright: desktop screenshots must be **identical**; mobile titles shrink.

### Phase 2 — Tap targets & sizing (B3–B5)
- Bump icon buttons, profile tabs, inputs to ≥44px on mobile via base/`sm:`.
- Tap-target audit script must report 0 violations.

### Phase 3 — Component reworks (B1, B2, C2, C5)
- **Filter sheet** for `/restaurants` (mobile only; inline bar stays at `lg:`).
- **Compare modal** mobile layout.
- **Sticky action bars** for detail + form Save (thumb zone).
- Each rebuilt component ships with its own Playwright screenshot.

### Phase 4 — Per-view sweeps & nav decision (C3, C4, C6, D)
- Groups/map/search audits at 375px; fix paddings, modal widths, button rows.
- Resolve the nav decision (drawer vs bottom tabs) and, if bottom tabs, port the
  prior iteration's `bottom-tab-bar.tsx` (no "Más" overflow — 5 fixed tabs).

### Phase 5 — Verification & sign-off
- Full Playwright run: **0 overflow** on every route at 375px; desktop diff = 0.
- `pnpm check` (lint + format + typecheck) green.
- Manual pass on a real device or DevTools at 360/390/414px widths.

---

## Verification checklist (per phase)

- [ ] `pnpm shots` → no route reports horizontal overflow at 375px.
- [ ] Desktop (1440px) screenshots identical to Phase 0 baseline (the `lg:` promise).
- [ ] Tap-target audit: 0 elements < 44×44px on mobile.
- [ ] All nav destinations reachable on mobile (incl. `/manager`).
- [ ] `pnpm check` passes.

## Suggested commit sequence

1. `chore(test): add playwright + responsive overflow spec`
2. `style(type): responsive page-title scale (mobile only)`
3. `fix(a11y): 44px tap targets on mobile`
4. `feat(restaurants): mobile filter sheet`
5. `feat(compare): mobile-friendly compare layout`
6. `feat(detail|forms): sticky thumb-zone action bars`
7. `feat(nav): <drawer polish | bottom tab bar>` (per the Phase 4 decision)
