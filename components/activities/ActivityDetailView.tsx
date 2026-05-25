"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ActivityBookingPanel } from "@/components/activities/booking/ActivityBookingPanel";
import { ActivityLocationMap } from "@/components/activities/ActivityLocationMap";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import { activityAllImages, toActivityCardData } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/i18n";
import { gridCards3, pageBottom, scrollRow, siteContainer } from "@/lib/layout";

interface ActivityDetailViewProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly related?: readonly Activity[];
}

type TabId = "description" | "gallery" | "location" | "included" | "policies";

export function ActivityDetailView({
  activity,
  locale,
  related = [],
}: ActivityDetailViewProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const gallery = activityAllImages(activity);
  const organizer =
    activity.organizer ?? activity.provider?.name ?? "Xora";

  const latitude = activity.latitude ?? (activity as Activity & { lat?: number }).lat;
  const longitude = activity.longitude ?? (activity as Activity & { lng?: number }).lng;
  const hasCoords =
    typeof latitude === "number" &&
    !Number.isNaN(latitude) &&
    typeof longitude === "number" &&
    !Number.isNaN(longitude);
  const hasLocationSection = hasCoords || Boolean(activity.location?.trim());

  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<TabId>("description");
  const rating = activity.rating ?? (activity as Activity & { reviewsCount?: number }).reviewsCount;

  const tabs = (
    [
      { id: "description" as const, label: labels.description, show: true },
      { id: "gallery" as const, label: labels.gallery, show: gallery.length > 0 },
      { id: "location" as const, label: labels.location, show: hasLocationSection },
      { id: "included" as const, label: labels.included, show: Boolean(activity.whats_included) },
      { id: "policies" as const, label: labels.policies, show: Boolean(activity.policies) },
    ] satisfies { id: TabId; label: string; show: boolean }[]
  ).filter((t) => t.show);

  const galleryEyebrow =
    locale === "ar" ? `${labels.organizer}: ${organizer}` : `${labels.organizer}: ${organizer}`;
  const gallerySubtitle = [activity.location, activity.price ? `${activity.price} / ${labels.perPerson}` : ""]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className={cn(siteContainer, pageBottom, "relative py-8 sm:py-10 lg:py-12")}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]"
        aria-hidden
      />

      <nav className="relative mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={localizedPath(locale, "/activities")} className="hover:text-white">
          {locale === "ar" ? "الأنشطة" : "Activities"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-300">{activity.title}</span>
      </nav>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start xl:gap-10">
        <div className="min-w-0 space-y-6">
          <div id="activity-hero" className="relative scroll-mt-24">
            {rating ? (
              <span className="absolute start-4 top-4 z-10 rounded-full border border-amber-400/40 bg-black/50 px-3 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur-md">
                ★ {Number(rating).toFixed(1)}
              </span>
            ) : null}
            <AccordionImageGallery
              images={gallery}
              locale={locale}
              title={activity.title}
              eyebrow={galleryEyebrow}
              subtitle={gallerySubtitle || undefined}
              activeIndex={activeImage}
              onActiveChange={setActiveImage}
              variant="dark"
              autoplay={gallery.length > 1}
            />
          </div>

          <div className={cn(scrollRow, "sm:flex-wrap")}>
            {activity.location ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                📍 {activity.location}
              </span>
            ) : null}
            {hasCoords ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                {locale === "ar" ? "موقع محدد على الخريطة" : "Pinned on map"}
              </span>
            ) : null}
            {activity.duration ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                ⏱ {activity.duration}
              </span>
            ) : null}
            {activity.difficulty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                ◆ {activity.difficulty}
              </span>
            ) : null}
            {activity.group_size ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                👥 {activity.group_size}
              </span>
            ) : null}
            {activity.price ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                {activity.price} / {labels.perPerson}
              </span>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6">
            <div className={cn(scrollRow, "border-b border-white/10 pb-px")}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "shrink-0 border-b-2 border-cyan-400 px-3 py-2.5 text-sm font-semibold text-cyan-100 sm:px-4"
                      : "shrink-0 px-3 py-2.5 text-sm text-slate-500 transition hover:text-slate-300 sm:px-4"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-5 text-sm leading-relaxed text-slate-300 sm:text-base">
              {tab === "description" ? (
                activity.description?.trim() ? (
                  <p className="whitespace-pre-line">{activity.description}</p>
                ) : (
                  <p className="text-slate-500">
                    {locale === "ar" ? "لا يوجد وصف لهذا النشاط بعد." : "No description yet."}
                  </p>
                )
              ) : null}
              {tab === "gallery" ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    {locale === "ar"
                      ? "مرّر المؤشر على الصورة لتوسيعها — أو اضغط للتثبيت"
                      : "Hover to expand — click to pin the slide"}
                  </p>
                  <AccordionImageGallery
                    images={gallery}
                    locale={locale}
                    title={activity.title}
                    eyebrow={galleryEyebrow}
                    subtitle={gallerySubtitle || undefined}
                    activeIndex={activeImage}
                    onActiveChange={setActiveImage}
                    variant="dark"
                    showCaption={false}
                    autoplay={false}
                  />
                </div>
              ) : null}
              {tab === "location" ? (
                <div className="space-y-4">
                  {activity.location ? (
                    <p className="flex items-start gap-2 text-base text-white">
                      <span className="text-lg" aria-hidden>
                        📍
                      </span>
                      <span>{activity.location}</span>
                    </p>
                  ) : null}
                  <ActivityLocationMap
                    locale={locale}
                    latitude={hasCoords ? latitude : null}
                    longitude={hasCoords ? longitude : null}
                    locationText={activity.location}
                    title={activity.title}
                  />
                </div>
              ) : null}
              {tab === "included" ? (
                <p className="whitespace-pre-line">{activity.whats_included}</p>
              ) : null}
              {tab === "policies" ? (
                <p className="whitespace-pre-line">{activity.policies}</p>
              ) : null}
            </div>
          </div>

          {related.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold text-white">{labels.recommended}</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {related.slice(0, 2).map((item) => (
                  <ActivityCard
                    key={item.id}
                    locale={locale}
                    activity={toActivityCardData(item)}
                    bookCta={labels.viewDetails}
                    imageAspect="16 / 10"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ActivityBookingPanel activity={activity} locale={locale} />
        </aside>
      </div>
    </div>
  );
}
