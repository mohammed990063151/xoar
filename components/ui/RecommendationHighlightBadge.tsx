"use client";

import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

export type RecommendationHighlightVariant = "trending" | "personal";

interface RecommendationHighlightBadgeProps {
  readonly label: string;
  readonly variant?: RecommendationHighlightVariant;
  readonly className?: string;
}

const variantStyles: Record<RecommendationHighlightVariant, string> = {
  trending:
    "border-amber-400/45 bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-rose-600/90 shadow-[0_4px_20px_rgba(245,158,11,0.35)]",
  personal:
    "border-violet-400/45 bg-gradient-to-r from-violet-600/95 to-fuchsia-600/90 shadow-[0_4px_20px_rgba(139,92,246,0.35)]",
};

export function RecommendationHighlightBadge({
  label,
  variant = "trending",
  className,
}: RecommendationHighlightBadgeProps): React.ReactElement {
  const icon = variant === "trending" ? "🔥" : "✨";

  return (
    <span
      className={cn(
        "inline-flex max-w-[calc(100%-3.5rem)] items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md",
        variantStyles[variant],
        className,
      )}
    >
      <span className="text-xs leading-none" aria-hidden>
        {icon}
      </span>
      <span className="truncate text-[10px] font-bold tracking-wide text-white sm:text-[11px]">
        {label}
      </span>
    </span>
  );
}

/** Short label for in-card badge from API reason text */
export function recommendationShortLabel(reason: string, locale: Locale): {
  label: string;
  variant: RecommendationHighlightVariant;
  hint?: string;
} {
  const ar = locale === "ar";
  const personal =
    reason.includes("حجزت") ||
    reason.includes("booked similar") ||
    reason.includes("Because you");

  if (personal) {
    return {
      label: ar ? "مُقترح لك" : "For you",
      variant: "personal",
      hint: ar ? "لأنك حجزت أنشطة مشابهة" : "Based on your bookings",
    };
  }

  return {
    label: ar ? "الأكثر حجزاً" : "Top booked",
    variant: "trending",
    hint: ar ? "هذا الأسبوع" : "This week",
  };
}
