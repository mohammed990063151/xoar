"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { cn } from "@/lib/cn";
import { normalizeStorageImageUrl, useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  siteContainer,
} from "@/lib/layout";
import type { EventGalleryItem } from "@/services/contentService";

interface WorksPortfolioProps {
  readonly locale: Locale;
  readonly title: string;
  readonly intro: string;
  readonly items: readonly EventGalleryItem[];
  readonly viewDetailsLabel: string;
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80";

/**
 * Editorial / cinematic case-study runway — deliberately unlike the events card grid.
 */
export function WorksPortfolio({
  locale,
  title,
  intro,
  items,
  viewDetailsLabel,
}: WorksPortfolioProps): React.ReactElement {
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const featured = items[active] ?? items[0];

  const chapters = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        indexLabel: String(index + 1).padStart(2, "0"),
        image: normalizeStorageImageUrl(item.image || PLACEHOLDER),
      })),
    [items],
  );

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(148,163,184,0.12),transparent),linear-gradient(180deg,rgba(15,23,42,0.2),transparent_55%)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-14">
            <SlideInEdge from={ar ? "end" : "start"}>
              <p className={pageEyebrow}>
                {ar ? "أرشيف مشاريع منفّذة" : "Delivered project archive"}
              </p>
              <h1 className={`mt-3 ${pageTitle}`}>{title}</h1>
              <p className={cn(pageIntro, "max-w-xl text-slate-400")}>{intro}</p>
              
              <p className="mt-6 text-sm text-slate-500">
                {ar
                  ? `${items.length} مشروع موثّق`
                  : `${items.length} documented projects`}
              </p>
            </SlideInEdge>

            {featured ? (
              <SlideInEdge from={ar ? "start" : "end"} delay={0.08}>
                <Link
                  href={localizedPath(locale, `/works/${featured.id}`)}
                  className="group relative block overflow-hidden rounded-[1.75rem] border border-white/10"
                >
                  <div className="relative aspect-[16/10] w-full bg-slate-950 sm:aspect-[16/9]">
                    <Image
                      src={normalizeStorageImageUrl(featured.image || PLACEHOLDER)}
                      alt={featured.title}
                      fill
                      priority
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width:1024px) 100vw, 55vw"
                      unoptimized={useUnoptimizedImage(featured.image || PLACEHOLDER)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {featured.filterLabel || (ar ? "مشروع مختار" : "Featured project")}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                        {featured.title}
                      </h2>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                        {viewDetailsLabel}
                        <span aria-hidden className="rtl:rotate-180">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </SlideInEdge>
            ) : null}
          </div>
        </div>
      </section>

      {chapters.length === 0 ? (
        <div className={siteContainer}>
          <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center text-slate-400">
            {ar
              ? "لا توجد أعمال بعد — أضفها من لوحة التحكم → أعمالنا."
              : "No works yet — add them from Dashboard → Our work."}
          </p>
        </div>
      ) : (
        <>
          <div className={cn(siteContainer, "mt-8 sm:mt-10")}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {ar ? "فهرس المشاريع" : "Project index"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {chapters.map((item, index) => {
                const selected = active === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "shrink-0 rounded-xl border px-4 py-2.5 text-start transition",
                      selected
                        ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200",
                    )}
                  >
                    <span className="block font-mono text-[10px] text-slate-500">
                      {item.indexLabel}
                    </span>
                    <span className="mt-0.5 block max-w-[10rem] truncate text-sm font-semibold">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 space-y-0 border-y border-white/5 sm:mt-14">
            {chapters.map((item, index) => {
              const reverse = index % 2 === 1;
              return (
                <ScrollReveal key={item.id}>
                  <article
                    className={cn(
                      "border-b border-white/5 last:border-b-0",
                      active === index && "bg-white/[0.015]",
                    )}
                  >
                    <div
                      className={cn(
                        siteContainer,
                        "grid items-stretch gap-0 py-10 sm:py-14 lg:grid-cols-2 lg:gap-0",
                      )}
                    >
                      <Link
                        href={localizedPath(locale, `/works/${item.id}`)}
                        className={cn(
                          "relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-[420px]",
                          reverse ? "lg:order-2" : "lg:order-1",
                        )}
                        onMouseEnter={() => setActive(index)}
                      >
                        <motion.div
                          className="absolute inset-0"
                          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                          transition={{ duration: 0.55 }}
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width:1024px) 100vw, 50vw"
                            unoptimized={useUnoptimizedImage(item.image)}
                          />
                        </motion.div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent" />
                        <span className="absolute start-4 top-4 font-mono text-4xl font-bold text-white/25 sm:text-5xl">
                          {item.indexLabel}
                        </span>
                      </Link>

                      <div
                        className={cn(
                          "flex flex-col justify-center px-1 py-8 sm:px-6 lg:px-12 lg:py-10",
                          reverse ? "lg:order-1" : "lg:order-2",
                        )}
                      >
                        {item.filterLabel ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {item.filterLabel}
                          </p>
                        ) : null}
                        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                          {item.title}
                        </h2>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
                          {item.description}
                        </p>
                        {(item.clientName || item.location) && (
                          <p className="mt-4 text-xs text-slate-500">
                            {[item.clientName, item.location].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <Link
                          href={localizedPath(locale, `/works/${item.id}`)}
                          className="mt-7 inline-flex w-fit items-center gap-2 border-b border-cyan-400/50 pb-1 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300 hover:text-white"
                        >
                          {viewDetailsLabel}
                          <span aria-hidden className="rtl:rotate-180">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
