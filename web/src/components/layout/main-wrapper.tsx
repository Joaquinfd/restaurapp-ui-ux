"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function MainWrapper({ children }: { children: ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col transition-all duration-300",
        collapsed ? "lg:pl-[72px]" : "lg:pl-60"
      )}
    >
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-950/80">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          aria-label="Abrir menú"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <Link href="/" className="text-lg font-bold tracking-tight">
          🍽️ {APP_NAME}
        </Link>
      </div>
      {children}
    </div>
  );
}
