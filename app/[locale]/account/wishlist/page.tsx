"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccountShell } from "@/components/account/AccountShell";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { useWishlist } from "@/hooks/useWishlist";
import { activitiesService } from "@/services/activitiesService";
import { toActivityCardData } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { gridCards3 } from "@/lib/layout";
import { useParams } from "next/navigation";

export default function AccountWishlistPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const { slugs } = useWishlist();
  const labels = bookingLabels(locale);
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    if (!slugs.length) {
      setItems([]);
      return;
    }
    activitiesService
      .list(locale, { per_page: 48 })
      .then((res) => {
        const matched = (res.data ?? []).filter((a) => slugs.includes(a.slug));
        setItems(matched);
      })
      .catch(() => setItems([]));
  }, [locale, slugs]);

  return (
    <AccountShell locale={locale} title={labels.addWishlist}>
      {items.length === 0 ? (
        <p className="text-slate-500">
          {locale === "ar"
            ? "لم تُضف أنشطة للمفضلة بعد."
            : "No wishlist items yet."}
        </p>
      ) : (
        <div className={gridCards3}>
          {items.map((activity) => (
            <ActivityCard
              key={activity.id}
              locale={locale}
              activity={toActivityCardData(activity)}
              bookCta={labels.bookNow}
              bookHref={`/activities/${activity.slug}#book`}
            />
          ))}
        </div>
      )}
      <Link
        href={localizedPath(locale, "/activities")}
        className="mt-8 inline-flex text-sm text-violet-300"
      >
        {locale === "ar" ? "تصفح الأنشطة" : "Browse activities"}
      </Link>
    </AccountShell>
  );
}
