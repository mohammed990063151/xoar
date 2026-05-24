"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ActivityBookingPanel } from "@/components/activities/booking/ActivityBookingPanel";
import { ActivityLocationMap } from "@/components/activities/ActivityLocationMap";
import { ActivityPhotoGallery } from "@/components/activities/ActivityPhotoGallery";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { activityAllImages, toActivityCardData } from "@/lib/activity";
import { bookingLabels } from "@/lib/booking-labels";
import { isStorageImage } from "@/lib/image-url";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

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

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: "description", label: labels.description, show: true },
    { id: "gallery", label: labels.gallery, show: gallery.length > 0 },
    { id: "location", label: labels.location, show: hasLocationSection },
    { id: "included", label: labels.included, show: Boolean(activity.whats_included) },
    { id: "policies", label: labels.policies, show: Boolean(activity.policies) },
  ].filter((t) => t.show);

  function selectGalleryImage(index: number): void {
    setActiveImage(index);
    document.getElementById("activity-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start">
        <div className="min-w-0 space-y-6">
          <div
            id="activity-hero"
            className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl scroll-mt-24"
          >
            <div className="relative aspect-[16/10] w-full bg-slate-900">
              <Image
                src={gallery[activeImage] ?? gallery[0]}
                alt={activity.title}
                fill
                className="object-cover"
                unoptimized={isStorageImage(gallery[activeImage] ?? "")}
                priority
                sizes="(max-width:1280px) 100vw, 65vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-transparent opacity-60" />
              {rating ? (
                <span className="absolute start-4 top-4 rounded-full border border-amber-400/40 bg-black/50 px-3 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur-md">
                  ★ {Number(rating).toFixed(1)}
                </span>
              ) : null}
              <div className="absolute bottom-4 end-4 start-4 sm:bottom-6 sm:start-6 sm:end-auto">
                <p className="text-xs text-slate-300/90">
                  {labels.organizer}: {activity.organizer ?? activity.provider?.name ?? "Xora"}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  {activity.title}
                </h1>
              </div>
            </div>

            {gallery.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={
                      i === activeImage
                        ? "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950"
                        : "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl opacity-60 hover:opacity-100"
                    }
                  >
                    <Image src={src} alt="" fill className="object-cover" unoptimized sizes="96px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-1 border-b border-white/10 pb-px">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "border-b-2 border-cyan-400 px-4 py-2.5 text-sm font-semibold text-cyan-100"
                      : "px-4 py-2.5 text-sm text-slate-500 transition hover:text-slate-300"
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
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    {locale === "ar"
                      ? `${gallery.length} ${gallery.length === 1 ? "صورة" : "صور"} — اضغط على صورة لعرضها في الأعلى`
                      : `${gallery.length} photo${gallery.length === 1 ? "" : "s"} — tap to preview above`}
                  </p>
                  <ActivityPhotoGallery
                    images={gallery}
                    title={activity.title}
                    activeIndex={activeImage}
                    onSelect={selectGalleryImage}
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

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <ActivityBookingPanel activity={activity} locale={locale} />
        </aside>
      </div>
    </div>
  );
}
