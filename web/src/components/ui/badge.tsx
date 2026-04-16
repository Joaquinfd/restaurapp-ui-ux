import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default"
          ? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          : "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
      )}
    >
      {children}
    </span>
  );
}
