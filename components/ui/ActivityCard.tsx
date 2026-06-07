"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { ActivityBadgeRibbon } from "@/components/ui/ActivityBadgeRibbon";
import type { RecommendationHighlightVariant } from "@/components/ui/RecommendationHighlightBadge";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatSarPrice } from "@/lib/format-price";
import { ActivityCardMediaSlider } from "@/components/ui/ActivityCardMediaSlider";
import type { ActivityCardMediaSlide } from "@/components/ui/ActivityCardMediaSlider";
import { ActivityCardMediaOverlays } from "@/components/features/ActivityCardMediaOverlays";
import { BookingCountdown } from "@/components/features/BookingCountdown";
import type { ActivityCardSocialProofData } from "@/types/activity-card-social";
import { useWishlist } from "@/hooks/useWishlist";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

export interface ActivityCardData {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly organizer?: string;
  readonly location?: string;
  readonly eventDate?: string;
  readonly price?: string;
  readonly shortLabel?: string;
  readonly badge?: string;
  readonly badgeLabel?: string;
  readonly rating?: number;
  readonly reviewsCount?: number;
  readonly socialProofCard?: ActivityCardSocialProofData | null;
  readonly showWishlist?: boolean;
  readonly cardHighlight?: {
    label: string;
    hint?: string | null;
    variant?: RecommendationHighlightVariant;
  } | null;
  readonly endsAt?: string;
  readonly mediaSlides?: readonly ActivityCardMediaSlide[];
  readonly promoVideoUrl?: string;
}

interface ActivityCardProps {
  readonly locale: Locale;
  readonly activity: ActivityCardData;
  readonly bookCta: string;
  readonly bookHref?: string;
  readonly className?: string;
  readonly onBook?: () => void;
  readonly showWishlist?: boolean;
  /** In-card recommendation tag e.g. «الأكثر حجزاً» */
  readonly highlightLabel?: string;
  readonly highlightVariant?: RecommendationHighlightVariant;
  readonly highlightHint?: string;
  readonly showSocialProof?: boolean;
  readonly showCountdown?: boolean;
}

function IconPin({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 17s5-4.5 5-9a5 5 0 1 0-10 0c0 4.5 5 9 5 9Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

function IconCalendar({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ActivityCard({
  locale,
  activity,
  bookCta,
  bookHref,
  className,
  onBook,
  showWishlist = true,
  highlightLabel,
  highlightVariant = "trending",
  highlightHint,
  showSocialProof = true,
  showCountdown = false,
}: ActivityCardProps): React.ReactElement {
  const router = useRouter();
  const { toggle, has } = useWishlist();
  const path = localizedPath(locale, `/activities/${activity.slug}`);
  const ctaPath = bookHref ? localizedPath(locale, bookHref) : `${path}#book`;
  const slideUrl = (url: string) => typeof url === "string" && url.trim() !== "";
  const fromMedia = (activity.mediaSlides ?? []).filter((s) => slideUrl(s.url));
  const slides =
    fromMedia.length > 0
      ? fromMedia
      : [
          {
            type: "image" as const,
            url: slideUrl(activity.image) ? activity.image.trim() : ACTIVITY_FALLBACK_IMAGE,
          },
        ];
  const priceDisplay = formatSarPrice(activity.price, locale);
  const wished = has(activity.slug);
  const ar = locale === "ar";
  const highlightLabelResolved = highlightLabel ?? activity.cardHighlight?.label;
  const highlightHintResolved = highlightHint ?? activity.cardHighlight?.hint ?? undefined;
  const highlightVariantResolved = (activity.cardHighlight?.variant ??
    highlightVariant) as RecommendationHighlightVariant;
  const wishlistVisible = showWishlist && (activity.showWishlist ?? true);

  const bookButtonClass =
    "flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(99,102,241,0.3)] transition hover:brightness-110";

  const goToDetail = () => router.push(path);

  return (
    <motion.div
      className={cn("gradient-border group h-full", className)}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex h-full flex-col overflow-hidden">
        <div className="relative w-full shrink-0">
          <ActivityCardMediaSlider
            slides={slides}
            title={activity.title}
            locale={locale}
            onSlideClick={goToDetail}
          />

          <ActivityBadgeRibbon
            badge={activity.badge}
            badgeLabel={activity.badgeLabel}
            locale={locale}
          />

          {wishlistVisible ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(activity.slug);
              }}
              className={cn(
                "absolute end-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition",
                wished
                  ? "border-rose-400/50 bg-rose-500/25 text-rose-300"
                  : "border-white/20 bg-black/40 text-white hover:bg-black/60",
              )}
              aria-pressed={wished}
              aria-label={ar ? "أضف للمفضلة" : "Add to wishlist"}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          ) : null}

          <ActivityCardMediaOverlays
            locale={locale}
            socialProof={activity.socialProofCard}
            showSocialProof={showSocialProof}
            highlightLabel={highlightLabelResolved}
            highlightHint={highlightHintResolved}
            highlightVariant={highlightVariantResolved}
            hasPrice={Boolean(activity.price?.trim())}
          />

          {activity.price?.trim() ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-gradient-to-t from-[#05050c] to-[#05050c]/85 px-3 py-2 backdrop-blur-sm">
              <p className="text-base font-bold tracking-tight text-white">{priceDisplay}</p>
              <p className="text-[9px] text-slate-500">{ar ? "للشخص" : "per person"}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-start gap-1.5 p-3">
          {activity.shortLabel ? (
            <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium text-violet-200">
              {activity.shortLabel}
            </span>
          ) : null}

          <Link href={path}>
            <h3 className="line-clamp-1 text-sm font-bold leading-snug text-white transition group-hover:text-purple-200 sm:text-base">
              {activity.title}
            </h3>
          </Link>

          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
            {activity.location ? (
              <span className="inline-flex items-center gap-1">
                <IconPin className="h-3.5 w-3.5 text-purple-400" />
                {activity.location}
              </span>
            ) : null}
            {activity.eventDate ? (
              <span className="inline-flex items-center gap-1">
                <IconCalendar className="h-3.5 w-3.5 text-purple-400" />
                {activity.eventDate}
              </span>
            ) : null}
          </div>

          {showCountdown && activity.endsAt ? (
            <BookingCountdown
              endsAt={activity.endsAt}
              enabled
              locale={locale}
              compact
            />
          ) : null}

          {onBook ? (
            <button type="button" onClick={onBook} className={cn(bookButtonClass, "mt-1")}>
              {bookCta}
            </button>
          ) : (
            <Link href={ctaPath} className={cn(bookButtonClass, "mt-1")}>
              {bookCta}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
