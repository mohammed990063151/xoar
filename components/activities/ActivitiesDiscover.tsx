"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { toActivityCardData } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import type { ActivitiesListingContent } from "@/lib/site-page";
import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import type { Activity } from "@/types/api";

interface ActivitiesDiscoverProps {
  readonly locale: Locale;
  readonly page: ActivitiesListingContent;
  readonly initialActivities?: Activity[];
}

function ActivityCardSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
      <div className="aspect-[4/3] bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-white/10" />
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="h-10 rounded-xl bg-white/5" />
        <div className="h-10 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function ActivitiesDiscover({
  locale,
  page,
  initialActivities = [],
}: ActivitiesDiscoverProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialActivities.forEach((a) => {
      const label = a.short_label ?? (a as Activity & { shortLabel?: string }).shortLabel;
      if (label) set.add(label);
    });
    return Array.from(set);
  }, [initialActivities]);

  useEffect(() => {
    if (initialActivities.length > 0 && !search && !location) return;

    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (location) qs.set("location", location);
    qs.set("per_page", "24");

    fetch(`${getApiBaseUrl()}/api/activities/${locale}?${qs}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : { data: initialActivities }))
      .then((json: { data: Activity[] }) => setActivities(json.data ?? []))
      .catch(() => setActivities(initialActivities))
      .finally(() => setLoading(false));
  }, [locale, search, location, initialActivities]);

  const filtered = activities.filter((a) => {
    if (!category) return true;
    const label = a.short_label ?? (a as Activity & { shortLabel?: string }).shortLabel ?? "";
    return label === category;
  });

  const resultLabel =
    locale === "ar"
      ? `${filtered.length} نشاط متاح`
      : `${filtered.length} activities available`;

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(168,85,247,0.16),transparent),radial-gradient(ellipse_50%_45%_at_0%_100%,rgba(59,130,246,0.1),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              {page.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-400/90">
                  {page.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {page.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                {page.intro}
              </p>
            </div>

            <div className="relative mx-auto mt-8 max-w-2xl">
              <input
                type="search"
                placeholder={labels.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/12 bg-slate-950/90 py-3.5 pe-4 ps-11 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
              />
              <span
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="9" r="5.5" />
                  <path d="M14 14l3 3" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10">
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="gradient-border">
              <div className="inner p-5 sm:p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M3 5h14M5 5V3h10v2M6 9h2M6 13h2M12 9h2M12 13h2" />
                    </svg>
                  </span>
                  {locale === "ar" ? "تصفية النتائج" : "Filter results"}
                </p>

                <label className="mt-5 block text-sm text-slate-400">
                  {labels.filterLocation}
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={locale === "ar" ? "مثال: الرياض" : "e.g. Riyadh"}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/50"
                  />
                </label>

                {categories.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-sm text-slate-400">{labels.filterCategory}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCategory("")}
                        className={
                          !category
                            ? "rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100"
                            : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                        }
                      >
                        {labels.all}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={
                            category === cat
                              ? "rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100"
                              : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-slate-200"
                          }
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(search || location || category) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setLocation("");
                      setCategory("");
                    }}
                    className="mt-5 w-full rounded-xl border border-white/10 py-2 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    {locale === "ar" ? "مسح التصفية" : "Clear filters"}
                  </button>
                )}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{resultLabel}</p>
              {loading ? (
                <span className="text-xs text-cyan-400/80">{labels.loading}</span>
              ) : null}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ActivityCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.45 }}
                  >
                    <ActivityCard
                      locale={locale}
                      activity={toActivityCardData(activity)}
                      imageAspect="4 / 3"
                      bookCta={page.detailCta}
                      className="h-full shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
                <p className="text-lg font-medium text-slate-300">{labels.noResults}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {locale === "ar"
                    ? "جرّب تغيير كلمات البحث أو الموقع."
                    : "Try different search terms or location."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
