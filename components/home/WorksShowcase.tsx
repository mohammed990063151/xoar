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

const FILTER_ACCENTS: Record<string, string> = {
  all: "from-violet-500 to-blue-500",
  individual: "from-rose-500 to-orange-500",
  exhibitions: "from-cyan-500 to-blue-600",
  entertainment: "from-amber-500 to-orange-500",
};

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
        "group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950",
        featured && "rounded-3xl",
        className,
      )}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
        <Image
          src={image}
          alt={work.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-106"
          sizes={featured ? "(max-width:1024px) 100vw, 60vw" : "(max-width:768px) 100vw, 33vw"}
          unoptimized={useUnoptimizedImage(image)}
        />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

        {/* Category badge */}
        {work.filterLabel ? (
          <span className="absolute start-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            {work.filterLabel}
          </span>
        ) : null}

        {/* Content overlay */}
        <div className={cn("absolute inset-x-0 bottom-0", featured ? "p-6 sm:p-8" : "p-4 sm:p-5")}>
          <h3
            className={cn(
              "font-bold leading-tight text-white",
              featured ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
            )}
          >
            {work.title}
          </h3>
          {work.description ? (
            <p
              className={cn(
                "mt-1.5 text-slate-300",
                featured ? "max-w-lg text-sm line-clamp-2" : "line-clamp-1 text-xs text-slate-400",
              )}
            >
              {work.description}
            </p>
          ) : null}
          <span
            className={cn(
              "mt-3 inline-flex items-center gap-2 font-semibold text-cyan-300 transition-all group-hover:gap-3 group-hover:text-cyan-200",
              featured ? "text-sm" : "text-xs",
            )}
          >
            {cta}
            <span aria-hidden className="rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
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
    <section id="events" className={cn(homeSection, "scroll-mt-24 overflow-hidden")}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_20%,rgba(34,211,238,0.1),transparent),radial-gradient(ellipse_50%_40%_at_85%_75%,rgba(139,92,246,0.1),transparent)]"
        aria-hidden
      />

      <div className={siteContainer}>
        {/* ── Header ── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SlideInEdge from={ar ? "end" : "start"} className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {ar ? "فعالياتنا" : "Our events"}
            </p>
            <h2 className={cn("mt-2 gradient-text", homeSectionTitle)}>
              {section.title}
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400">
              {section.subtitle}
            </p>
          </SlideInEdge>

          <SlideInEdge from={ar ? "start" : "end"} delay={0.08} className="flex flex-col items-stretch gap-3 sm:items-end">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={ar ? "تصفية الفعاليات" : "Filter events"}>
              {filters.map((tab) => {
                const active = filter === tab.id;
                const gradient = FILTER_ACCENTS[tab.id] ?? "from-violet-500 to-blue-500";
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(tab.id)}
                    className={cn(
                      "works-filter-btn relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                      active
                        ? cn("bg-gradient-to-l text-white shadow-lg", gradient)
                        : "border border-white/15 bg-white/[0.04] text-slate-300 hover:border-white/30 hover:text-white",
                    )}
                  >
                    {active && !reduceMotion && (
                      <motion.span
                        layoutId="filter-pill"
                        className={cn("absolute inset-0 rounded-full bg-gradient-to-l -z-10", gradient)}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* View all */}
            <Link
              href={eventsPath}
              className="works-view-all group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white"
            >
              {viewAllWorksLabel}
              <span className="text-lg transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" aria-hidden>→</span>
            </Link>
          </SlideInEdge>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <p className="mt-14 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-slate-400">
            {ar ? "لا توجد فعاليات في هذا التصنيف حالياً." : "No events in this category yet."}
          </p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-12 lg:gap-5"
            >
              {/* Featured */}
              {featured ? (
                <motion.div
                  className="lg:col-span-7"
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <WorkThumb
                    work={featured}
                    locale={locale}
                    cta={viewDetailsLabel}
                    aspect="16 / 11"
                    featured
                    className="shadow-[0_32px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                  />
                </motion.div>
              ) : null}

              {/* Side stack */}
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-4">
                {rest.map((work, index) => (
                  <motion.div
                    key={work.slug}
                    initial={reduceMotion ? false : { opacity: 0, x: ar ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + index * 0.06, duration: 0.4 }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                  >
                    <WorkThumb
                      work={work}
                      locale={locale}
                      cta={viewDetailsLabel}
                      aspect={index === 0 ? "16 / 9" : "16 / 8"}
                      className="shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Extra scroll row */}
              {filtered.length > 5 ? (
                <div className="lg:col-span-12">
                  <div className="mt-2 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
                    {filtered.slice(5).map((work) => (
                      <div key={work.slug} className="w-[min(78vw,280px)] shrink-0">
                        <WorkThumb work={work} locale={locale} cta={viewDetailsLabel} aspect="4 / 3" />
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
