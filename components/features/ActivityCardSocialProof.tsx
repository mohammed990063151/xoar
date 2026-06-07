"use client";

import type { ActivityCardSocialProofData } from "@/types/activity-card-social";
import type { Locale } from "@/lib/i18n";

export type { ActivityCardSocialProofData } from "@/types/activity-card-social";

interface ActivityCardSocialProofProps {
  readonly locale: Locale;
  readonly data?: ActivityCardSocialProofData | null;
  readonly compact?: boolean;
}

function IconEye(): React.ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path
        d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** Full-width social proof block (detail pages). Card uses ActivityCardMediaOverlays on image. */
export function ActivityCardSocialProof({
  locale,
  data,
  compact = false,
}: ActivityCardSocialProofProps): React.ReactElement | null {
  if (!data?.show) return null;

  const ar = locale === "ar";
  const offer = data.offerPeriod?.trim();
  const views = data.viewsCount ?? 0;
  const monthly = data.monthlyBookings ?? 0;
  const rating = typeof data.rating === "number" ? data.rating : 0;
  const urgency = data.urgency?.show && data.urgency.message?.trim();

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-slate-900/50 px-3 py-2">
        {offer ? (
          <span className="rounded-md border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
            {offer}
          </span>
        ) : null}
        {views > 0 ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <IconEye />
            {ar ? `${views} مشاهدة` : `${views} views`}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
          ★ {rating.toFixed(1)}
        </span>
        <span className="text-[10px] text-slate-400">
          {ar ? `شهر: ${monthly}` : `mo: ${monthly}`}
        </span>
        {urgency ? (
          <span className="w-full text-[10px] font-bold text-red-400">{data.urgency?.message}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2 border-b border-white/10 bg-slate-900/40 px-3 py-2">
      {offer ? (
        <p className="text-center text-[10px] font-semibold text-amber-100/95">{offer}</p>
      ) : null}
      {views > 0 ? (
        <p className="flex items-center justify-center gap-1 text-[10px] text-slate-300">
          <IconEye />
          {ar ? `شاهد العرض ${views} شخص` : `${views} viewed`}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-0.5 rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
          ★ {rating.toFixed(1)}/5
        </span>
        <span className="inline-flex rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
          {ar ? `حجز الشهر: ${monthly}` : `Month: ${monthly}`}
        </span>
      </div>
      {urgency ? (
        <p className="text-center text-[10px] font-bold text-red-400">{data.urgency?.message}</p>
      ) : null}
    </div>
  );
}
