"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import type { HomeWork, WorksSectionCopy } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/i18n";
import { normalizeStorageImageUrl, useUnoptimizedImage } from "@/lib/image-url";
import { homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

interface WorksShowcaseProps {
  readonly locale: Locale;
  readonly section: WorksSectionCopy;
  readonly works: readonly HomeWork[];
  readonly viewDetailsLabel: string;
  readonly viewAllWorksLabel: string;
}

type FilterId = "all" | "individual" | "exhibitions" | "entertainment";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80";

function WorkThumb({
  work,
  locale,
  cta,
  className,
  aspect = "4 / 3",
  featured = false,
}: {
  work: HomeWork;
  locale: Locale;
  cta: string;
  className?: string;
  aspect?: string;
  featured?: boolean;
}): React.ReactElement {
  const href = localizedPath(locale, `/works/${work.slug}`);
  const image = normalizeStorageImageUrl(work.image || PLACEHOLDER);

  return (
    <Link
      href={href}
      className={cn(
        "group relative block h-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950",
        className,
      )}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
        <Image
          src={image}
          alt={work.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes={featured ? "(max-width:1024px) 100vw, 60vw" : "(max-width:768px) 100vw, 33vw"}
          unoptimized={useUnoptimizedImage(image)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/35 to-transparent" />
        {work.filterLabel ? (
          <span className="absolute start-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 backdrop-blur">
            {work.filterLabel}
          </span>
        ) : null}
        <div className={cn("absolute inset-x-0 bottom-0", featured ? "p-5 sm:p-7" : "p-4")}>
          <h3
            className={cn(
              "font-semibold text-white",
              featured ? "text-2xl sm:text-3xl lg:text-4xl" : "text-base sm:text-lg",
            )}
          >
            {work.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-slate-300",
              featured ? "max-w-xl text-sm sm:text-base line-clamp-2" : "line-clamp-2 text-xs sm:text-sm text-slate-400",
            )}
          >
            {work.description}
          </p>
          <span
            className={cn(
              "mt-3 inline-flex items-center gap-2 font-semibold text-cyan-300 transition group-hover:gap-3",
              featured ? "text-sm" : "text-xs",
            )}
          >
            {cta}
            <span aria-hidden className="rtl:rotate-180">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function WorksShowcase({
  locale,
  section,
  works,
  viewDetailsLabel,
  viewAllWorksLabel,
}: WorksShowcaseProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const eventsPath = localizedPath(locale, "/works");
  const ar = locale === "ar";
  const [filter, setFilter] = useState<FilterId>("all");

  const filters = useMemo(
    () =>
      [
        { id: "all" as const, label: ar ? "الكل" : "All" },
        { id: "individual" as const, label: ar ? "أفراد" : "Individuals" },
        { id: "exhibitions" as const, label: ar ? "معارض" : "Exhibitions" },
        { id: "entertainment" as const, label: ar ? "ترفيه" : "Entertainment" },
      ] as const,
    [ar],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return works;
    return works.filter((work) => work.filter === filter);
  }, [filter, works]);

  const featured = filtered[0];
  const rest = filtered.slice(1, 5);

  return (
    <section id="events" className={cn(homeSection, "scroll-mt-24")}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_10%,rgba(34,211,238,0.12),transparent),radial-gradient(ellipse_55%_45%_at_90%_80%,rgba(56,189,248,0.08),transparent)]"
        aria-hidden
      />
      <div className={siteContainer}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SlideInEdge from={ar ? "end" : "start"} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {ar ? "فعالياتنا" : "Our events"}
            </p>
            <h2 className={`mt-2 ${homeSectionTitle}`}>{section.title}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
              {section.subtitle}
            </p>
          </SlideInEdge>

          <SlideInEdge from={ar ? "start" : "end"} delay={0.08} className="flex flex-col items-stretch gap-3 sm:items-end">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label={ar ? "تصفية الفعاليات" : "Filter events"}
            >
              {filters.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-l from-cyan-500 to-sky-600 text-white shadow-[0_10px_28px_rgba(34,211,238,0.28)]"
                        : "border border-white/12 bg-white/[0.03] text-slate-300 hover:border-cyan-400/35 hover:text-white",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <Link
              href={eventsPath}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white"
            >
              {viewAllWorksLabel}
              <span className="text-lg rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
          </SlideInEdge>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-14 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-slate-400">
            {ar ? "لا توجد فعاليات في هذا التصنيف حالياً." : "No events in this category yet."}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-12 lg:gap-5"
            >
              {featured ? (
                <motion.div
                  className="lg:col-span-7"
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <WorkThumb
                    work={featured}
                    locale={locale}
                    cta={viewDetailsLabel}
                    aspect="16 / 11"
                    featured
                    className="shadow-[0_28px_70px_rgba(0,0,0,0.45)]"
                  />
                </motion.div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-5">
                {rest.length > 0
                  ? rest.map((work, index) => (
                      <motion.div
                        key={work.slug}
                        initial={reduceMotion ? false : { opacity: 0, x: ar ? -16 : 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + index * 0.06, duration: 0.45 }}
                        whileHover={reduceMotion ? undefined : { y: -3 }}
                      >
                        <WorkThumb
                          work={work}
                          locale={locale}
                          cta={viewDetailsLabel}
                          aspect={index === 0 ? "16 / 10" : "16 / 9"}
                          className="shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                        />
                      </motion.div>
                    ))
                  : null}
              </div>

              {filtered.length > 5 ? (
                <div className="lg:col-span-12">
                  <div className="mt-2 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
                    {filtered.slice(5).map((work) => (
                      <div key={work.slug} className="w-[min(78vw,280px)] shrink-0">
                        <WorkThumb
                          work={work}
                          locale={locale}
                          cta={viewDetailsLabel}
                          aspect="4 / 3"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
