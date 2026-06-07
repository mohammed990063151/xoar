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
  readonly highlightHint?: string;
  readonly highlightVariant?: RecommendationHighlightVariant;
  readonly hasPrice?: boolean;
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
  highlightHint,
  highlightVariant = "trending",
  hasPrice = false,
}: ActivityCardMediaOverlaysProps): React.ReactElement | null {
  const ar = locale === "ar";
  const proofOn = showSocialProof && socialProof?.show;
  const views = proofOn ? (socialProof?.viewsCount ?? 0) : 0;
  const rating = proofOn && typeof socialProof?.rating === "number" ? socialProof.rating : null;
  const monthly = proofOn ? (socialProof?.monthlyBookings ?? 0) : 0;
  const offer = proofOn ? socialProof?.offerPeriod?.trim() : "";
  const urgency = proofOn && socialProof?.urgency?.show ? socialProof.urgency.message?.trim() : "";
  const hasHighlight = Boolean(highlightLabel?.trim());

  if (!proofOn && !hasHighlight) return null;

  const hint =
    highlightHint?.trim() &&
    highlightHint.trim() !== offer
      ? highlightHint.trim()
      : "";

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
          {hint ? (
            <span className="rounded-md bg-black/45 px-2 py-0.5 text-[9px] font-medium text-white/90 backdrop-blur-sm">
              {hint}
            </span>
          ) : null}
          {views > 0 ? (
            <span className={cn(chipClass, "text-slate-200")}>
              <IconEye className="h-3.5 w-3.5 text-sky-300" />
              {ar ? `شاهد العرض ${views} شخص` : `${views} viewed`}
            </span>
          ) : null}
        </div>
      ) : null}

      {proofOn && (rating !== null || monthly > 0 || offer) ? (
        <div
          className={cn(
            "absolute inset-x-2 z-[25] flex flex-wrap items-center justify-center gap-1.5",
            hasPrice ? "bottom-[3.25rem]" : "bottom-3",
          )}
        >
          {rating !== null ? (
            <span className={cn(chipClass, "text-amber-200")}>
              <span aria-hidden>★</span>
              {rating.toFixed(1)}/5
            </span>
          ) : null}
          {monthly > 0 ? (
            <span className={cn(chipClass, "font-medium text-slate-200")}>
              {ar ? `حجز هذا الشهر: ${monthly}` : `Booked: ${monthly}`}
            </span>
          ) : null}
          {offer && !hint ? (
            <span className={cn(chipClass, "border-amber-400/30 text-amber-100")}>{offer}</span>
          ) : null}
        </div>
      ) : null}

      {urgency ? (
        <p
          className={cn(
            "absolute inset-x-2 z-[25] text-center text-[10px] font-bold text-red-300 drop-shadow",
            hasPrice ? "bottom-[4.75rem]" : "bottom-10",
          )}
        >
          <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-950/70 px-2 py-0.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
            {urgency}
          </span>
        </p>
      ) : null}
    </div>
  );
}
