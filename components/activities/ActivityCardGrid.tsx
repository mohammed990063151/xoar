"use client";

import { motion } from "framer-motion";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { useActivityRecommendations } from "@/hooks/useActivityRecommendations";
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
}

export function ActivityCardGrid({
  locale,
  activities,
  className,
}: ActivityCardGridProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const { isEnabled } = usePlatformFeatures(locale);
  const recommendationsEnabled = isEnabled("ai_recommendations");
  const { getHighlight } = useActivityRecommendations(locale, recommendationsEnabled);

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

        return (
          <motion.div
            key={activity.id ?? activity.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.45 }}
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
              showSocialProof={isEnabled("social_proof")}
              showWishlist={activity.showWishlist ?? true}
              showCountdown={isEnabled("countdown")}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
