"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "./sidebar-context";

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  "/map": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  ),
  "/search": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  ),
  "/groups": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20a4 4 0 00-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a4 4 0 10-4-4 4 4 0 004 4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 20a3.5 3.5 0 00-3-3.464" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5a3.25 3.25 0 010 6.5" />
    </svg>
  ),
  "/favorites": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  ),
  "/profile": (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        // Desktop-only chrome — mobile navigation is the bottom tab bar.
        "fixed top-0 left-0 z-50 hidden h-full flex-col border-r border-neutral-200 bg-white transition-all duration-300 lg:flex dark:border-neutral-800 dark:bg-neutral-950",
        collapsed ? "lg:w-[72px]" : "lg:w-60",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className={cn(
            "flex min-w-0 flex-col transition-opacity",
            collapsed && "lg:pointer-events-none lg:w-0 lg:overflow-hidden lg:opacity-0",
          )}
        >
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
            🍽️ <span className={cn(collapsed && "lg:hidden")}>{APP_NAME}</span>
          </span>
          {/* Brand tagline — hidden when the sidebar collapses */}
          <span
            className={cn(
              "truncate text-xs text-neutral-500 dark:text-neutral-400",
              collapsed && "lg:hidden",
            )}
          >
            Descubre tu próximo favorito
          </span>
        </Link>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <svg
            className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                collapsed && "lg:justify-center lg:px-0",
              )}
            >
              {NAV_ICONS[link.href]}
              <span className={cn(collapsed && "lg:hidden")}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        className={cn(
          "border-t border-neutral-200 p-3 dark:border-neutral-800",
          collapsed && "lg:flex lg:justify-center",
        )}
      >
        <ThemeToggle />
      </div>
    </aside>
  );
}
