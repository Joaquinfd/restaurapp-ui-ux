"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InviteLinkProps {
  link: string;
  label?: string;
  hint?: string;
  className?: string;
}

/** Copyable invite-link field. The link and its copy button sit as siblings in a flex
 *  row (no interactive control nested inside a paragraph), so it stays valid markup and
 *  the button never shifts as the link wraps. */
export function InviteLink({
  link,
  label = "Enlace de invitación",
  hint,
  className,
}: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <p className="min-w-0 flex-1 truncate font-mono text-sm text-neutral-500 dark:text-neutral-400">
          {link}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={handleCopy}
          aria-label={copied ? "Enlace copiado" : "Copiar enlace"}
          className="shrink-0 rounded-2xl"
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </div>
      {hint && <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>}
    </div>
  );
}
