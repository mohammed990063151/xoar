"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { EventDetailBook } from "@/components/events/EventDetailBook";
import { EventCard } from "@/components/ui/EventCard";
import { ShowcaseGallerySlider } from "@/components/ui/ShowcaseGallerySlider";
import { cn } from "@/lib/cn";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import {
  gridCards3,
  pageBottom,
  pageTitle,
  sectionBlock,
  siteContainer,
} from "@/lib/layout";
import type { EventGalleryItem } from "@/services/contentService";

interface EventDetailViewProps {
  readonly locale: Locale;
  readonly item: EventGalleryItem;
  readonly backLabel: string;
  readonly backHref?: string;
  readonly bookLabel: string;
  readonly relatedLabel: string;
  readonly highlightsLabel: string;
  readonly galleryLabel: string;
  readonly relatedBase?: string;
}

function formatEventDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function EventDetailView({
  locale,
  item,
  backLabel,
  backHref = "/works",
  bookLabel,
  relatedLabel,
  highlightsLabel,
  galleryLabel: _galleryLabel,
  relatedBase = "/works",
}: EventDetailViewProps): React.ReactElement {
  const cover = normalizeStorageImageUrl(item.image);
  const gallery = useMemo(() => {
    const urls = (item.gallery ?? [])
      .map((src) => normalizeStorageImageUrl(src))
      .filter(Boolean);
    if (cover && !urls.includes(cover)) {
      return [cover, ...urls];
    }
    return urls.length > 0 ? urls : cover ? [cover] : [];
  }, [cover, item.gallery]);

  const highlights = item.highlights ?? [];
  const related = item.related ?? [];
  const meta = [
    item.filterLabel,
    item.clientName,
    item.location,
    formatEventDate(item.eventDate, locale),
  ].filter(Boolean);

  return (
    <article className={pageBottom}>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(34,211,238,0.16),transparent),radial-gradient(ellipse_40%_40%_at_100%_80%,rgba(56,189,248,0.1),transparent)]" />
        <div className={`${siteContainer} relative py-8 sm:py-12 lg:py-14`}>
          <ScrollReveal>
            <Link
              href={localizedPath(locale, backHref)}
              className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              <span aria-hidden>←</span>
              {backLabel}
            </Link>
          </ScrollReveal>

          <ScrollReveal className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {locale === "ar" ? "من أعمالنا" : "From our portfolio"}
            </p>
            <h1 className={`mt-3 max-w-3xl ${pageTitle}`}>{item.title}</h1>

            {meta.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {meta.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}
          </ScrollReveal>

          <ScrollReveal className="mt-8">
            <ShowcaseGallerySlider
              images={gallery}
              locale={locale}
              title={item.title}
              autoplayMs={4000}
            />
          </ScrollReveal>

          <ScrollReveal className="mt-10 max-w-3xl">
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                {item.description}
              </p>

              {item.bodyExtra ? (
                <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-400 sm:text-base">
                  {item.bodyExtra}
                </div>
              ) : null}

              {highlights.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300/90">
                    {highlightsLabel}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {highlights.map((line) => (
                      <li key={line} className="flex gap-3 text-sm text-slate-200">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                          ✓
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <EventDetailBook
                label={bookLabel}
                source={`work-detail:${item.id}`}
                title={item.title}
              />
          </ScrollReveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className={sectionBlock}>
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{relatedLabel}</h2>
          </ScrollReveal>
          <div className={cn(gridCards3, "mt-8")}>
            {related.map((rel) => (
              <ScrollReveal key={rel.id}>
                <EventCard
                  locale={locale}
                  title={rel.title}
                  description={rel.description}
                  imageSrc={rel.image}
                  href={`${relatedBase}/${rel.id}`}
                  cta={locale === "ar" ? "التفاصيل" : "Details"}
                  imageAspect="4 / 3"
                  badge={rel.filterLabel}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
