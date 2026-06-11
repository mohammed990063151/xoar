"use client";

import {
  RecommendationHighlightBadge,
  type RecommendationHighlightVariant,
} from "@/components/ui/RecommendationHighlightBadge";
import type { ActivityCardSocialProofData } from "@/types/activity-card-social";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

interface ActivityCardMediaOverlaysProps {
  readonly locale: Locale;
  readonly socialProof?: ActivityCardSocialProofData | null;
  readonly showSocialProof?: boolean;
  readonly highlightLabel?: string;
  readonly highlightVariant?: RecommendationHighlightVariant;
}

function IconEye({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const chipClass =
  "inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md";

export function ActivityCardMediaOverlays({
  locale,
  socialProof,
  showSocialProof = true,
  highlightLabel,
  highlightVariant = "trending",
}: ActivityCardMediaOverlaysProps): React.ReactElement | null {
  const ar = locale === "ar";
  const proofOn = showSocialProof && socialProof?.show;
  const views = proofOn ? (socialProof?.viewsCount ?? 0) : 0;
  const hasHighlight = Boolean(highlightLabel?.trim());

  if (!proofOn && !hasHighlight) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[25]" aria-hidden={false}>
      {(hasHighlight || views > 0) ? (
        <div className="absolute start-2 top-10 z-[25] flex max-w-[78%] flex-col items-start gap-1.5">
          {hasHighlight && highlightLabel ? (
            <RecommendationHighlightBadge
              label={highlightLabel}
              variant={highlightVariant}
              className="max-w-full px-2 py-0.5 text-[9px] sm:text-[10px]"
            />
          ) : null}
          {views > 0 ? (
            <span className={cn(chipClass, "text-slate-200")}>
              <IconEye className="h-3.5 w-3.5 text-sky-300" />
              {ar ? `شاهد العرض ${views} شخص` : `${views} viewed`}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
