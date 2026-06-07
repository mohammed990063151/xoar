"use client";

import { activityBadgeLabel, activityBadgeStripClass } from "@/lib/activity-badge";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

interface ActivityBadgeRibbonProps {
  readonly badge?: string | null;
  readonly badgeLabel?: string | null;
  readonly locale: Locale;
  readonly className?: string;
}

/** Diagonal ribbon across the activity image corner */
export function ActivityBadgeRibbon({
  badge,
  badgeLabel,
  locale,
  className,
}: ActivityBadgeRibbonProps): React.ReactElement | null {
  const text = activityBadgeLabel(badge, locale, badgeLabel ?? undefined);
  const stripClass = activityBadgeStripClass(badge);
  if (!text) return null;

  const ar = locale === "ar";

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-20 overflow-hidden", className)}
      aria-label={text}
      role="img"
    >
      <div
        className={cn(
          "absolute top-0 min-w-[200%] bg-gradient-to-r px-20 py-1.5 text-center shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:py-2",
          stripClass,
          ar
            ? "start-0 -translate-x-[30%] translate-y-[24%] -rotate-45"
            : "end-0 translate-x-[30%] translate-y-[24%] rotate-45",
        )}
      >
        <span className="block text-[10px] font-bold tracking-[0.18em] text-white sm:text-[11px]">
          {text}
        </span>
      </div>
    </div>
  );
}
