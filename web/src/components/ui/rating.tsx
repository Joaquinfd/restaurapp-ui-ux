interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export function Rating({ value, reviewCount, size = "md" }: RatingProps) {
  const stars = Math.round(value);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}>
            ★
          </span>
        ))}
      </div>
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{value.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-neutral-500 dark:text-neutral-400">({reviewCount})</span>
      )}
    </div>
  );
}
