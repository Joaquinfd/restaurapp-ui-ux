"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function MainWrapper({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isMap = pathname === "/map";

  return (
    <div
      className={cn(
        // `min-w-0` lets this flex-1 column shrink below its content's intrinsic
        // width. Without it the column refuses to shrink, so on narrow screens any
        // wide child pushes the page past the viewport — the browser then renders
        // it "zoomed in" and cropped. This is the core mobile responsiveness fix.
        "flex min-h-full min-w-0 flex-1 flex-col transition-all duration-300",
        collapsed ? "lg:pl-[72px]" : "lg:pl-60",
        // Reserve space for the fixed bottom tab bar on mobile (hidden at lg+).
        // The map is full-bleed and sizes itself, so it opts out.
        !isMap && "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0",
      )}
    >
      {/* Mobile top brand bar — primary navigation is the bottom tab bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md lg:hidden dark:border-neutral-800 dark:bg-neutral-950/80">
        <Link href="/" className="text-lg font-bold tracking-tight">
          🍽️ {APP_NAME}
        </Link>
      </div>
      {children}
    </div>
  );
}
