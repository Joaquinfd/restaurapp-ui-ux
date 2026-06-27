import { cn } from "@/lib/utils";

interface ProgressProps {
  /** Current value. */
  value: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  className?: string;
}

/** Slim, rounded progress bar that follows the app's neutral + blue accent tokens. */
function Progress({ value, max = 100, className }: ProgressProps) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out dark:bg-blue-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Progress };
