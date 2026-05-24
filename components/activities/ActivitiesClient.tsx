"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ActivityBookingModal } from "@/components/activities/ActivityBookingModal";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { toActivityCardData } from "@/lib/activity";
import type { Dictionary } from "@/lib/dictionary";
import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import type { Activity } from "@/types/api";

import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import type { Dictionary } from "@/lib/dictionary";
interface ActivitiesClientProps {
  readonly dict: Dictionary["pages"]["activities"];
  readonly cta: string;
  readonly initialActivities?: Activity[];
  readonly activityTabs: Dictionary["activityTabs"];
  readonly activityCards: Dictionary["activityCards"];
  readonly cta: string;
  readonly formTitle: string;
}

export function ActivitiesClient({
  dict,
<<<<<<< HEAD
  cta,
  initialActivities = [],
=======
  activityTabs,
  activityCards,
  cta,
  formTitle,
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3
}: ActivitiesClientProps): React.ReactElement {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingActivity, setBookingActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (initialActivities.length > 0 && !search && !location) return;

<<<<<<< HEAD
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (location) qs.set("location", location);
    qs.set("per_page", "12");

    fetch(
      `${getApiBaseUrl()}/api/activities/${locale}?${qs}`,
      { headers: { Accept: "application/json" } },
    )
      .then((r) => (r.ok ? r.json() : { data: initialActivities }))
      .then((json: { data: Activity[] }) => setActivities(json.data ?? []))
      .catch(() => setActivities(initialActivities))
      .finally(() => setLoading(false));
  }, [locale, search, location, initialActivities]);
=======
  const current =
    activityCards.items.find((item) => item.id === active) ?? activityCards.items[0];

  if (!current) {
    return <div className={cn(siteContainer, "py-16")} />;
  }
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3

  return (
    <div className={cn(siteContainer, "py-16")}>
      <ScrollReveal>
        <h1 className="text-3xl font-bold sm:text-4xl">{dict.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{dict.intro}</p>
      </ScrollReveal>

<<<<<<< HEAD
      <div className="mt-8 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={locale === "ar" ? "بحث..." : "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        />
        <input
          type="text"
          placeholder={locale === "ar" ? "الموقع..." : "Location..."}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
        />
      </div>

      {loading ? (
        <p className="mt-10 text-center text-slate-400">
          {locale === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      ) : activities.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              locale={locale}
              activity={toActivityCardData(activity)}
              imageAspect="16 / 10"
              bookCta={cta}
              onBook={() => setBookingActivity(activity)}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400"
        >
          {locale === "ar" ? "لا توجد أنشطة متاحة حالياً" : "No activities available"}
        </motion.div>
      )}

      {bookingActivity ? (
        <ActivityBookingModal
          activity={bookingActivity}
          locale={locale}
          onClose={() => setBookingActivity(null)}
        />
      ) : null}
=======
      <div className="mt-10 flex flex-wrap justify-center gap-2 sm:justify-start">
        {activityTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative overflow-hidden rounded-2xl border px-4 py-2 text-sm font-medium transition",
              active === tab.id
                ? "border-transparent text-white"
                : "border-white/15 text-slate-300 hover:text-white",
            )}
          >
            {active === tab.id ? (
              <motion.span
                layoutId="actTab"
                className="absolute inset-0 bg-gradient-to-l from-violet-600/80 to-cyan-600/60"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{tab.short}</span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-lg">
        <ActivityCard
          key={current.id}
          activity={current}
          organizerLabel={activityCards.organizerLabel}
          bookCta={cta}
          formTitle={formTitle}
        />
      </div>
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3
    </div>
  );
}
