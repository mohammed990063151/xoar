"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ActivityCard } from "@/components/ui/ActivityCard";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney } from "@/lib/booking";
import { bookingLabels } from "@/lib/booking-labels";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
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
} from "@/lib/layout";
import { EquipmentStrip } from "@/components/equipment/EquipmentStrip";
import type { EquipmentOffering } from "@/types/equipment-offering";
import type { EventOffering, EventOfferingAudience } from "@/types/event-offering";

interface EventOfferingsCatalogProps {
  readonly locale: Locale;
  readonly audience: EventOfferingAudience;
  readonly offerings: EventOffering[];
  readonly copy: Dictionary["pages"]["individualEvents"] | Dictionary["pages"]["corporateEvents"];
  readonly equipmentItems?: EquipmentOffering[];
}

export function EventOfferingsCatalog({
  locale,
  audience,
  offerings,
  copy,
  equipmentItems = [],
}: EventOfferingsCatalogProps): React.ReactElement {
  const ar = locale === "ar";
  const labels = bookingLabels(locale);
  const basePath = audience === "individual" ? "/individual-events" : "/corporate-events";
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offerings;
    return offerings.filter((item) => {
      const hay = `${item.title} ${item.shortLabel ?? ""} ${item.city ?? ""} ${item.location ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [offerings, search]);

  const resultLabel = ar
    ? `${filtered.length} فعالية متاحة`
    : `${filtered.length} events available`;

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(16,185,129,0.14),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className={pageHeroCentered}>
            <p className={pageEyebrow}>{copy.eyebrow}</p>
            <h1 className={pageTitle}>{copy.title}</h1>
            <p className={`${pageIntro} text-slate-400`}>{copy.intro}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={localizedPath(
                  locale,
                  audience === "corporate" ? "/individual-events" : "/corporate-events",
                )}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                {audience === "corporate"
                  ? ar
                    ? "فعاليات الأفراد"
                    : "Individual events"
                  : ar
                    ? "فعاليات الشركات"
                    : "Corporate events"}
              </Link>
              <Link
                href={localizedPath(locale, "/activities")}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                {ar ? "الأنشطة الترفيهية" : "Entertainment activities"}
              </Link>
              <Link
                href={localizedPath(locale, "/equipment")}
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/20"
              >
                {ar ? "تأجير المعدات" : "Equipment rental"}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <input
              type="search"
              placeholder={ar ? "ابحث عن فعالية…" : "Search events…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/90 py-3.5 pe-4 ps-11 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
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
        </div>
      </section>

      <section className={sectionBlockTight}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{resultLabel}</p>
        </div>

        {filtered.length > 0 ? (
          <div className={gridCards3}>
            {filtered.map((item, index) => {
              const href = `${basePath}/${item.slug}`;
              return (
                <ActivityCard
                  key={item.id}
                  locale={locale}
                  detailHref={href}
                  bookHref={href}
                  bookCta={copy.cta || labels.bookNow}
                  showWishlist={false}
                  showSocialProof={false}
                  showCountdown={false}
                  imagePriority={index < 4}
                  className="h-full shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                  activity={{
                    slug: item.slug,
                    title: item.title,
                    description: item.description ?? "",
                    image: item.image || ACTIVITY_FALLBACK_IMAGE,
                    location:
                      item.locationMode === "customer_choice"
                        ? ar
                          ? "في موقعك"
                          : "At your venue"
                        : item.city || item.location || undefined,
                    price: formatMoney(item.basePriceAmount || 0, locale),
                    comparePrice: item.comparePrice || undefined,
                    shortLabel: item.shortLabel || copy.eyebrow,
                    mediaSlides: [
                      item.image,
                      ...(item.gallery ?? []),
                    ]
                      .filter(Boolean)
                      .map((url) => ({ type: "image" as const, url: String(url) })),
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium text-slate-300">
              {ar ? "لا توجد فعاليات منشورة حالياً" : "No published events yet"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {ar
                ? "يمكنك إرسال طلب مخصص وسيتواصل فريقنا معك."
                : "You can still send a custom request and our team will follow up."}
            </p>
            <Link
              href={localizedPath(locale, "/request-event")}
              className="mt-6 inline-flex rounded-full border border-emerald-400/35 px-5 py-2.5 text-sm text-emerald-100 transition hover:border-emerald-300/50"
            >
              {ar ? "طلب مخصص" : "Custom request"}
            </Link>
          </div>
        )}

        <EquipmentStrip locale={locale} audience={audience} items={equipmentItems} />
      </section>
    </div>
  );
}
