"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ICONS: Record<string, React.ReactNode> = {
  "/groups": (
    <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20a4 4 0 00-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a4 4 0 10-4-4 4 4 0 004 4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 20a3.5 3.5 0 00-3-3.464" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5a3.25 3.25 0 010 6.5" />
    </svg>
  ),
};

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-t border-neutral-200 bg-white md:hidden dark:border-neutral-800 dark:bg-neutral-950">
      <ul className="space-y-1 px-4 py-3">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                pathname === link.href
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              )}
            >
              {MOBILE_NAV_ICONS[link.href]}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
