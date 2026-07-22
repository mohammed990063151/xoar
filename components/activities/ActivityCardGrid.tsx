"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { useActivityRecommendations, type ActivityHighlightMeta } from "@/hooks/useActivityRecommendations";
import { usePlatformFeatures } from "@/hooks/usePlatformFeatures";
import { toActivityCardData } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import { cn } from "@/lib/cn";
import { gridCards3 } from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import type { Activity } from "@/types/api";

interface ActivityCardGridProps {
  readonly locale: Locale;
  readonly activities: readonly Activity[];
  readonly className?: string;
  readonly getHighlight?: (slug: string) => ActivityHighlightMeta | undefined;
  readonly showSocialProof?: boolean;
  readonly showCountdown?: boolean;
}

export function ActivityCardGrid({
  locale,
  activities,
  className,
  getHighlight: getHighlightProp,
  showSocialProof: showSocialProofProp,
  showCountdown: showCountdownProp,
}: ActivityCardGridProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const reduceMotion = useReducedMotion();
  const { isEnabled } = usePlatformFeatures(locale);
  const recommendationsEnabled = isEnabled("ai_recommendations");
  const { getHighlight: getHighlightFromHook } = useActivityRecommendations(
    locale,
    recommendationsEnabled && !getHighlightProp,
  );

  const getHighlight = getHighlightProp ?? getHighlightFromHook;
  const showSocialProof = showSocialProofProp ?? isEnabled("social_proof");
  const showCountdown = showCountdownProp ?? isEnabled("countdown");

  return (
    <div className={cn(gridCards3, className)}>
      {activities.map((activity, index) => {
        const fromAdmin = activity.cardHighlight;
        const fromRec = getHighlight(activity.slug);
        const highlight = fromAdmin
          ? {
              label: fromAdmin.label,
              variant: (fromAdmin.variant ?? "trending") as "trending",
              hint: fromAdmin.hint ?? undefined,
            }
          : fromRec;

        const animateIn = !reduceMotion && index < 8;

        return (
          <motion.div
            key={activity.id ?? activity.slug}
            initial={animateIn ? { opacity: 0, y: 12 } : false}
            animate={animateIn ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.35 }}
          >
            <ActivityCard
              locale={locale}
              activity={toActivityCardData(activity)}
              bookCta={labels.bookNow}
              bookHref={`/activities/${activity.slug}#book`}
              className="h-full shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
              highlightLabel={highlight?.label}
              highlightVariant={highlight?.variant}
              highlightHint={highlight?.hint}
              showSocialProof={showSocialProof}
              showWishlist={activity.showWishlist ?? true}
              showCountdown={showCountdown}
              imagePriority={index < 4}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
