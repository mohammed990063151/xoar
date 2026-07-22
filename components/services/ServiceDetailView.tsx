"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { BookButton } from "@/components/ui/BookButton";
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
import type { ServiceDetail } from "@/services/contentService";

interface ServiceDetailViewProps {
  readonly locale: Locale;
  readonly item: ServiceDetail;
  readonly backLabel: string;
  readonly bookLabel: string;
  readonly relatedLabel: string;
  readonly highlightsLabel: string;
  readonly contactCta: string;
}

export function ServiceDetailView({
  locale,
  item,
  backLabel,
  bookLabel,
  relatedLabel,
  highlightsLabel,
  contactCta,
}: ServiceDetailViewProps): React.ReactElement {
  const cover = normalizeStorageImageUrl(item.image);
  const gallery = useMemo(() => {
    const urls = (item.gallery ?? [])
      .map((src) => normalizeStorageImageUrl(src))
      .filter(Boolean);
    if (cover && !urls.includes(cover)) return [cover, ...urls];
    return urls.length > 0 ? urls : cover ? [cover] : [];
  }, [cover, item.gallery]);

  const highlights = item.highlights ?? [];
  const related = item.related ?? [];
  const body = item.body?.trim() || item.description;

  return (
    <article className={pageBottom}>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_-10%,rgba(59,130,246,0.2),transparent),radial-gradient(ellipse_45%_40%_at_90%_70%,rgba(34,211,238,0.1),transparent)]" />
        <div className={`${siteContainer} relative py-8 sm:py-12 lg:py-14`}>
          <ScrollReveal>
            <Link
              href={localizedPath(locale, "/services")}
              className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
            >
              <span aria-hidden>←</span>
              {backLabel}
            </Link>
          </ScrollReveal>

          <ScrollReveal className="mt-6">
            {item.shortLabel ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
                {item.shortLabel}
              </p>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {locale === "ar" ? "خدمة من اكسورا" : "Xora service"}
              </p>
            )}
            <h1 className={`mt-3 max-w-3xl ${pageTitle}`}>{item.title}</h1>
          </ScrollReveal>

          <ScrollReveal className="mt-8">
            <ShowcaseGallerySlider
              images={gallery}
              locale={locale}
              title={item.title}
              autoplayMs={4200}
            />
          </ScrollReveal>

          <ScrollReveal className="mt-10 max-w-3xl">
              <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                {item.description}
              </p>

              {body && body !== item.description ? (
                <div className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-400 sm:text-base">
                  {body}
                </div>
              ) : null}

              {highlights.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300/90">
                    {highlightsLabel}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {highlights.map((line) => (
                      <li key={line} className="flex gap-3 text-sm text-slate-200">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-200">
                          ◆
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <BookButton
                  type="service"
                  variant="event"
                  source={`service-detail:${item.slug}`}
                  title={item.title}
                  className="inline-flex rounded-full bg-gradient-to-l from-blue-600 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20"
                >
                  {bookLabel}
                </BookButton>
                <Link
                  href={localizedPath(locale, "/contact")}
                  className="inline-flex rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  {contactCta}
                </Link>
              </div>
            </ScrollReveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className={sectionBlock}>
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{relatedLabel}</h2>
          </ScrollReveal>
          <div className={cn(gridCards3, "mt-8")}>
            {related.map((rel, index) => (
              <ScrollReveal key={rel.slug || rel.id}>
                <ServiceCard
                  locale={locale}
                  title={rel.title}
                  description={rel.description}
                  href={`/services/${rel.slug || rel.id}`}
                  cta={locale === "ar" ? "التفاصيل" : "Details"}
                  imageSrc={rel.image}
                  indexLabel={String(index + 1).padStart(2, "0")}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
