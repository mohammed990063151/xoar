"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ActivityBookingPanel,
  type BookingScheduleSelection,
} from "@/components/activities/booking/ActivityBookingPanel";
import { ActivitySocialProof } from "@/components/features/ActivitySocialProof";
import { ActivityOfferPeriod } from "@/components/features/ActivityOfferPeriod";
import { BookingCountdown } from "@/components/features/BookingCountdown";
import { AddToCalendarButton } from "@/components/features/AddToCalendarButton";
import { GroupBookingPanel } from "@/components/features/GroupBookingPanel";
import { WaitlistPanel } from "@/components/features/WaitlistPanel";
import { usePlatformFeatures } from "@/hooks/usePlatformFeatures";
import type { PlatformFeature } from "@/services/featureService";
import { ActivityLocationMap } from "@/components/activities/ActivityLocationMap";
import { ActivityProductHighlights } from "@/components/activities/ActivityProductHighlights";
import { ActivityBadgeRibbon } from "@/components/ui/ActivityBadgeRibbon";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import {
  activityAllImages,
  activityEndsAt,
  activityGalleryUrls,
  activityPromoVideoUrl,
  activityShortLabel,
  toActivityCardData,
} from "@/lib/activity";
import { activityCategoryIcon } from "@/lib/activity-category-icon";
import { bookingLabels } from "@/lib/booking-labels";
import { ActivityPriceDisplay } from "@/components/ui/ActivityPriceDisplay";
import { formatSarPrice } from "@/lib/format-price";
import type { Activity, FaqItem } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { scrollToHashWhenReady } from "@/lib/scroll-to";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/i18n";
import { gridCards3, pageBottom, scrollRow, siteContainer } from "@/lib/layout";

interface ActivityDetailViewProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly related?: readonly Activity[];
  readonly initialFeatures?: readonly PlatformFeature[];
}

type TabId = "description" | "terms" | "organizer" | "faq" | "location";

export function ActivityDetailView({
  activity,
  locale,
  related = [],
  initialFeatures,
}: ActivityDetailViewProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const { isEnabled } = usePlatformFeatures(
    locale,
    initialFeatures ? [...initialFeatures] : undefined,
  );
  const galleryImages = activityAllImages(activity);
  const promoVideo = activityPromoVideoUrl(activity);
  const organizer = activity.organizer ?? activity.provider?.name ?? "Xora";
  const categoryLabel = activityShortLabel(activity);
  const categoryIcon = activityCategoryIcon(activity.slug);
  const ticketHighlights =
    activity.ticket_highlights ?? activity.ticketHighlights ?? [];
  const faqItems = (activity.faq ?? []) as FaqItem[];
  const terms =
    activity.terms_conditions ?? activity.termsConditions ?? activity.policies;
  const organizerBio = activity.organizer_bio ?? activity.organizerBio ?? "";
  const endsAt = activityEndsAt(activity);
  const offerPeriod =
    activity.offerPeriod?.trim() ||
    activity.socialProofCard?.offerPeriod?.trim() ||
    "";
  const offerPeriodActive = Boolean(activity.offerPeriodActive);
  const countdownLive = isEnabled("countdown") && Boolean(activity.countdown?.show);

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
  const [bookingSchedule, setBookingSchedule] = useState<BookingScheduleSelection>({
    dateFrom: "",
    dateTo: "",
    bookingTime: "",
  });
  const [partySize, setPartySize] = useState(1);
  const [groupBookingActive, setGroupBookingActive] = useState(false);
  const onBookingScheduleChange = useCallback((schedule: BookingScheduleSelection) => {
    setBookingSchedule(schedule);
  }, []);
  const rating = activity.rating;
  const reviewsCount =
    activity.reviews_count ?? (activity as Activity & { reviewsCount?: number }).reviewsCount;

  const tabs = (
    [
      { id: "description" as const, label: labels.description, show: true },
      { id: "terms" as const, label: labels.terms, show: Boolean(terms?.trim()) },
      {
        id: "organizer" as const,
        label: labels.organizerTab,
        show: Boolean(organizerBio?.trim()) || Boolean(organizer),
      },
      { id: "faq" as const, label: labels.faq, show: faqItems.length > 0 },
      { id: "location" as const, label: labels.location, show: hasLocationSection },
    ] satisfies { id: TabId; label: string; show: boolean }[]
  ).filter((t) => t.show);

  const galleryEyebrow = `${labels.organizer}: ${organizer}`;
  const gallerySubtitle = [
    activity.location,
    activity.price ? formatSarPrice(activity.price, locale) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const sliderImages =
    galleryImages.length > 0 ? galleryImages : activityGalleryUrls(activity);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#book") return;
    return scrollToHashWhenReady("#book");
  }, [activity.slug]);

  return (
    <div className={cn(siteContainer, pageBottom, "relative py-8 sm:py-10 lg:py-12")}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_60%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]"
        aria-hidden
      />

      <nav className="relative mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={localizedPath(locale, "/activities")} scroll={false} className="hover:text-white">
          {locale === "ar" ? "الأنشطة الترفيهية" : "Entertainment activities"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-300">{activity.title}</span>
      </nav>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start xl:gap-10">
        <div className="min-w-0 space-y-6">
          <div id="activity-hero" className="relative scroll-mt-24 space-y-4">
            {rating ? (
              <span className="absolute start-4 top-4 z-10 rounded-full border border-amber-400/40 bg-black/50 px-3 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur-md">
                ★ {Number(rating).toFixed(1)}
                {reviewsCount ? (
                  <span className="ms-1 text-xs font-normal text-slate-400">
                    ({reviewsCount})
                  </span>
                ) : null}
              </span>
            ) : null}
            <div className="relative">
              <ActivityBadgeRibbon
                badge={activity.badge}
                badgeLabel={activity.badgeLabel}
                locale={locale}
              />
              <AccordionImageGallery
                images={sliderImages}
                locale={locale}
                title={activity.title}
                eyebrow={galleryEyebrow}
                subtitle={gallerySubtitle || undefined}
                activeIndex={activeImage}
                onActiveChange={setActiveImage}
                variant="dark"
                showCaption={false}
                autoplay={sliderImages.length + (promoVideo ? 1 : 0) > 1}
                videoUrl={promoVideo}
              />
            </div>
          </div>

          <header className="space-y-2">
            <h1 className="text-[clamp(1.35rem,5.2vw,2.125rem)] font-bold leading-tight tracking-tight text-white text-balance">
              {activity.title}
            </h1>
            <p className="text-sm text-slate-400">
              {labels.organizer}:{" "}
              <span className="text-slate-200">{organizer}</span>
              {categoryLabel ? (
                <>
                  <span className="mx-1.5 text-slate-600" aria-hidden>
                    ·
                  </span>
                  <span className="text-violet-300">{categoryLabel}</span>
                </>
              ) : null}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-2.5">
            {activity.location ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-3 min-[400px]:col-span-2">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-lg"
                  aria-hidden
                >
                  📍
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-200/70">
                    {locale === "ar" ? "الموقع" : "Location"}
                  </p>
                  <p className="truncate text-sm font-medium text-white" title={activity.location}>
                    {activity.location}
                  </p>
                </div>
              </div>
            ) : null}
            {activity.duration ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg"
                  aria-hidden
                >
                  ⏱
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {locale === "ar" ? "المدة" : "Duration"}
                  </p>
                  <p className="text-sm font-medium text-slate-200">{activity.duration}</p>
                </div>
              </div>
            ) : null}
            {categoryLabel ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-lg"
                  aria-hidden
                >
                  {categoryIcon}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
                    {locale === "ar" ? "التصنيف" : "Category"}
                  </p>
                  <p className="text-sm font-medium text-violet-100">{categoryLabel}</p>
                </div>
              </div>
            ) : null}
            {hasCoords ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-lg"
                  aria-hidden
                >
                  🗺
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                    {locale === "ar" ? "الخريطة" : "Map"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("location");
                      window.requestAnimationFrame(() => {
                        document
                          .getElementById("activity-tabs")
                          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      });
                    }}
                    className="text-start text-sm font-medium text-emerald-100 underline-offset-2 hover:underline"
                  >
                    {locale === "ar" ? "عرض على الخريطة" : "View on map"}
                  </button>
                </div>
              </div>
            ) : null}
            {offerPeriod ? (
              <ActivityOfferPeriod
                locale={locale}
                offerPeriod={offerPeriod}
                active={offerPeriodActive}
                variant="detail"
              />
            ) : null}
            {activity.price || activity.activeCoupon ? (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-3 min-[400px]:col-span-2 sm:col-span-1">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-xs font-bold text-cyan-100"
                  aria-hidden
                >
                  {locale === "ar" ? "ر.س" : "SAR"}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80">
                    {locale === "ar" ? "السعر" : "Price"}
                  </p>
                  <ActivityPriceDisplay
                    locale={locale}
                    price={
                      activity.activeCoupon
                        ? (activity.displayPrice ?? activity.price)
                        : (activity.originalPrice ?? activity.original_price ?? activity.price)
                    }
                    comparePrice={
                      activity.activeCoupon
                        ? (activity.originalPrice ?? activity.original_price ?? activity.comparePrice)
                        : undefined
                    }
                    showCompare={Boolean(activity.activeCoupon)}
                    perPerson
                    size="sm"
                    className="!gap-1.5"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <a
            href="#book"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-gradient-to-l from-cyan-600/90 to-violet-600/90 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/40 transition hover:brightness-110 lg:hidden"
          >
            {labels.bookNow}
            {activity.price ? (
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold">
                {formatSarPrice(
                  activity.activeCoupon
                    ? (activity.displayPrice ?? activity.price)
                    : (activity.originalPrice ?? activity.original_price ?? activity.price),
                  locale,
                )}
              </span>
            ) : null}
          </a>

          <div
            id="activity-tabs"
            className="scroll-mt-24 rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6"
          >
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
                <div className="space-y-6">
                  {ticketHighlights.length > 0 ? (
                    <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 sm:p-5">
                      <h3 className="mb-3 text-sm font-bold text-violet-100">
                        {labels.ticketIncludes}
                      </h3>
                      <ActivityProductHighlights locale={locale} items={ticketHighlights} />
                    </section>
                  ) : null}
                  {activity.description?.trim() ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {locale === "ar" ? "عن النشاط" : "About this activity"}
                      </h3>
                      <p className="whitespace-pre-line">{activity.description}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">
                      {locale === "ar" ? "لا يوجد وصف لهذا النشاط بعد." : "No description yet."}
                    </p>
                  )}
                  {activity.whats_included?.trim() ? (
                    <div>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {labels.included}
                      </h3>
                      <p className="whitespace-pre-line text-slate-400">{activity.whats_included}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {tab === "terms" ? (
                <p className="whitespace-pre-line">{terms}</p>
              ) : null}
              {tab === "organizer" ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-white">{organizer}</p>
                  <p className="whitespace-pre-line text-slate-400">
                    {organizerBio ||
                      (locale === "ar"
                        ? "فريق محترف يقدّم تجربة متكاملة من التخطيط حتى التنفيذ."
                        : "A professional team delivering end-to-end experiences.")}
                  </p>
                </div>
              ) : null}
              {tab === "faq" ? (
                <div className="space-y-4">
                  {faqItems.map((item, i) => (
                    <details
                      key={`faq-${i}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <summary className="cursor-pointer font-semibold text-white marker:content-none">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-slate-400">{item.answer}</p>
                    </details>
                  ))}
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
            </div>
          </div>
        </div>

        <aside className="scroll-mt-24 space-y-4 lg:sticky lg:top-24 lg:self-start">
          {offerPeriod ? (
            <ActivityOfferPeriod
              locale={locale}
              offerPeriod={offerPeriod}
              active={offerPeriodActive}
              variant="sidebar"
            />
          ) : null}
          <BookingCountdown
            endsAt={activity.countdown?.show ? activity.countdown.endsAt : null}
            enabled={countdownLive}
            locale={locale}
          />
          <ActivitySocialProof
            locale={locale}
            data={activity.socialProof}
            enabled={isEnabled("social_proof")}
          />
          <AddToCalendarButton
            activity={activity}
            locale={locale}
            enabled={isEnabled("calendar_export")}
          />
          <GroupBookingPanel
            activity={activity}
            locale={locale}
            enabled={isEnabled("group_booking")}
            dateFrom={bookingSchedule.dateFrom}
            dateTo={bookingSchedule.dateTo}
            bookingTime={bookingSchedule.bookingTime}
            active={groupBookingActive}
            onActiveChange={setGroupBookingActive}
            membersCount={partySize}
            onMembersCountChange={setPartySize}
          />
          {activity.isFull && isEnabled("waitlist") ? (
            <WaitlistPanel slug={activity.slug} locale={locale} enabled />
          ) : (
            <ActivityBookingPanel
              activity={activity}
              locale={locale}
              giftBookingEnabled={!groupBookingActive}
              onScheduleChange={onBookingScheduleChange}
              partySize={partySize}
              onPartySizeChange={setPartySize}
              forceGroup={groupBookingActive}
            />
          )}
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="relative mt-10 border-t border-white/10 pt-10 sm:mt-12 sm:pt-12">
          <h2 className="text-lg font-bold text-white sm:text-xl">{labels.recommended}</h2>
          <div className={cn("mt-4", gridCards3)}>
            {related.slice(0, 2).map((item) => (
              <ActivityCard
                key={item.id}
                locale={locale}
                activity={toActivityCardData(item)}
                bookCta={labels.bookNow}
                showSocialProof={isEnabled("social_proof")}
                showCountdown={isEnabled("countdown")}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
