"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivitiesFilters, type ActivitiesFilterState } from "@/components/activities/ActivitiesFilters";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ActivityCardGrid } from "@/components/activities/ActivityCardGrid";
import { normalizeActivityFromApi } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import type { ActivitiesListingContent } from "@/lib/site-page";
import { activitiesService } from "@/services/activitiesService";
import {
  gridCards3,
  pageBottom,
  pageEyebrow,
  pageHeroCentered,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionBlockTight,
  siteContainer,
} from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import { ActivitiesLocationsMap } from "@/components/features/ActivitiesLocationsMap";
import { useActivityRecommendations } from "@/hooks/useActivityRecommendations";
import { usePlatformFeatures } from "@/hooks/usePlatformFeatures";
import type { Activity } from "@/types/api";

interface ActivitiesDiscoverProps {
  readonly locale: Locale;
  readonly page: ActivitiesListingContent;
  readonly initialActivities?: Activity[];
}

function ActivityCardSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
      <div className="min-h-[240px] bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-white/10" />
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
  const { isEnabled, loading: featuresLoading } = usePlatformFeatures(locale);
  const mapEnabled = featuresLoading || isEnabled("map_discovery");
  const recommendationsEnabled = isEnabled("ai_recommendations");
  const { highlightedSlugs } = useActivityRecommendations(
    locale,
    recommendationsEnabled,
  );
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [geoFilters, setGeoFilters] = useState<ActivitiesFilterState>({
    city: "",
    date: "",
    category: "",
  });
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
    const hasFilters =
      search || geoFilters.city || geoFilters.date || geoFilters.category;
    if (initialActivities.length > 0 && !hasFilters) {
      setActivities(initialActivities);
      return;
    }

    setLoading(true);
    activitiesService
      .list(locale, {
        search: search || undefined,
        city: geoFilters.city || undefined,
        date: geoFilters.date || undefined,
        category: geoFilters.category || undefined,
        per_page: 24,
      })
      .then((json) => setActivities((json.data ?? []).map(normalizeActivityFromApi)))
      .catch(() => setActivities(initialActivities))
      .finally(() => setLoading(false));
  }, [locale, search, geoFilters, initialActivities]);

  const resultLabel =
    locale === "ar"
      ? `${activities.length} نشاط متاح`
      : `${activities.length} activities available`;

  const hasActiveFilters =
    search || geoFilters.city || geoFilters.date || geoFilters.category;

  const sortedActivities = useMemo(() => {
    if (hasActiveFilters || highlightedSlugs.size === 0) return activities;
    const highlighted: Activity[] = [];
    const rest: Activity[] = [];
    for (const a of activities) {
      if (highlightedSlugs.has(a.slug)) highlighted.push(a);
      else rest.push(a);
    }
    return [...highlighted, ...rest];
  }, [activities, highlightedSlugs, hasActiveFilters]);

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(168,85,247,0.16),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <ScrollReveal>
            <div className={pageHeroCentered}>
              {page.eyebrow ? <p className={pageEyebrow}>{page.eyebrow}</p> : null}
              <h1 className={pageTitle}>
                {locale === "ar" ? "الأنشطة الترفيهية" : page.title}
              </h1>
              <p className={`${pageIntro} text-slate-400`}>{page.intro}</p>
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

      <section className={sectionBlockTight}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,240px)_1fr] xl:grid-cols-[minmax(0,280px)_1fr] lg:gap-10">
          <aside className="order-2 h-fit lg:order-1 lg:sticky lg:top-24">
            <div className="gradient-border">
              <div className="inner p-5 sm:p-6">
                <ActivitiesFilters
                  locale={locale}
                  value={geoFilters}
                  onChange={setGeoFilters}
                  fallbackCategories={categories}
                />

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setGeoFilters({ city: "", date: "", category: "" });
                    }}
                    className="mt-5 w-full rounded-xl border border-white/10 py-2 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    {locale === "ar" ? "مسح التصفية" : "Clear filters"}
                  </button>
                ) : null}
              </div>
            </div>
          </aside>

          <div className="order-1 min-w-0 lg:order-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{resultLabel}</p>
              {loading ? (
                <span className="text-xs text-cyan-400/80">{labels.loading}</span>
              ) : null}
            </div>

            {loading ? (
              <div className={gridCards3}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ActivityCardSkeleton key={i} />
                ))}
              </div>
            ) : sortedActivities.length > 0 ? (
              <ActivityCardGrid locale={locale} activities={sortedActivities} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
                <p className="text-lg font-medium text-slate-300">{labels.noResults}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {locale === "ar"
                    ? "جرّب تغيير المدينة أو التاريخ أو الفئة."
                    : "Try a different city, date, or category."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {mapEnabled ? (
        <div className={`${siteContainer} mt-12 pb-4`}>
          <ActivitiesLocationsMap
            locale={locale}
            activities={sortedActivities}
            enabled={mapEnabled}
          />
        </div>
      ) : null}
    </div>
  );
}
