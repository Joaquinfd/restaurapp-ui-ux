import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeft } from "@hugeicons/core-free-icons";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Panel de gestión",
    template: "%s — RestaurApp",
  },
};

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Manager top bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <HugeiconsIcon icon={ChevronLeft} size={16} />
            RestaurApp
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            Panel de gestión
          </span>
        </div>
      </header>
      {children}
      <Toaster />
    </div>
  );
}
