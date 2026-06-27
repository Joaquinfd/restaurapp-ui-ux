"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_TABS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { NAV_ICONS } from "./nav-icons";

function matchesHref(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function isActive(pathname: string, tab: (typeof PRIMARY_TABS)[number]) {
  return [tab.href, ...(tab.match ?? [])].some((h) => matchesHref(pathname, h));
}

/**
 * Mobile bottom navigation: the app's top-level destinations pinned in the thumb
 * zone. Hidden at `lg+` where the desktop sidebar takes over. Active state uses a
 * prefix match (plus each tab's `match` prefixes) so nested routes — and the
 * /restaurants browse under the Inicio tab — keep the right tab lit.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-950/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-16 items-stretch">
        {PRIMARY_TABS.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
                  active
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400",
                )}
              >
                <span aria-hidden>{NAV_ICONS[tab.href]}</span>
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
