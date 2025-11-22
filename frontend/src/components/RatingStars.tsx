import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

type SizeKey = keyof typeof sizeMap;

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: SizeKey;
  showValue?: boolean;
  decimals?: number;
  className?: string;
  onSelect?: (value: number) => void;
  readOnly?: boolean;
}

const RatingStars = ({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  decimals = 2,
  className,
  onSelect,
  readOnly = false,
}: RatingStarsProps) => {
  const clampedRating = Math.max(0, Math.min(max, rating ?? 0));
  const roundedForDisplay = Math.round(clampedRating * 2) / 2;
  const interactive = Boolean(onSelect) && !readOnly;

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const fraction = Math.min(Math.max(roundedForDisplay - index, 0), 1);
    const clipValue = `${(1 - fraction) * 100}%`;

    const starShape = (
      <span
        className={cn(
          "relative inline-flex",
          interactive ? "cursor-pointer" : "cursor-default"
        )}
      >
        <Star
          className={cn("text-muted-foreground", sizeMap[size])}
          strokeWidth={1.5}
        />
        {fraction > 0 && (
          <Star
            className={cn("absolute inset-0 text-yellow-400", sizeMap[size])}
            strokeWidth={1.5}
            fill="currentColor"
            style={{ clipPath: `inset(0 ${clipValue} 0 0)` }}
          />
        )}
      </span>
    );

    if (!interactive) {
      return (
        <span key={starValue} className="inline-flex">
          {starShape}
        </span>
      );
    }

    return (
      <button
        key={starValue}
        type="button"
        onClick={() => onSelect?.(starValue)}
        className="p-0 bg-transparent border-none"
        aria-label={`Select ${starValue} star${starValue > 1 ? "s" : ""}`}
      >
        {starShape}
      </button>
    );
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground">
          {clampedRating.toFixed(decimals)} / {max}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
