"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { EventCard } from "@/components/ui/EventCard";
import type { HomeWork, WorksSectionCopy } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/i18n";
import { gridCards3, homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

interface WorksShowcaseProps {
  readonly locale: Locale;
  readonly section: WorksSectionCopy;
  readonly works: readonly HomeWork[];
  readonly viewDetailsLabel: string;
  readonly viewAllWorksLabel: string;
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80";

export function WorksShowcase({
  locale,
  section,
  works,
  viewDetailsLabel,
  viewAllWorksLabel,
}: WorksShowcaseProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const eventsPath = localizedPath(locale, "/events");
  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <section className={homeSection}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(59,130,246,0.14),transparent)]"
        aria-hidden
      />
      <div className={siteContainer}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-start">
          <SlideInEdge from={locale === "ar" ? "end" : "start"} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
              {locale === "ar" ? "أعمالنا" : "Our work"}
            </p>
            <h2 className={`mt-2 ${homeSectionTitle}`}>{section.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-400">{section.subtitle}</p>
          </SlideInEdge>
          <SlideInEdge from={locale === "ar" ? "start" : "end"} delay={0.08}>
            <Link
              href={eventsPath}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white"
            >
              {viewAllWorksLabel}
              <span className="text-lg rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
          </SlideInEdge>
        </div>

        {works.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">
            {locale === "ar" ? "لا توجد أعمال منشورة حالياً." : "No published works yet."}
          </p>
        ) : (
          <div className={cn(gridCards3, "mt-10 sm:mt-14")}>
            {works.map((work, index) => (
              <motion.div
                key={work.slug}
                custom={index}
                variants={reduceMotion ? undefined : cardVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={{ once: true, margin: "-40px" }}
              >
                <EventCard
                  locale={locale}
                  title={work.title}
                  description={work.description}
                  imageSrc={work.image || PLACEHOLDER}
                  href={`/events/${work.slug}`}
                  cta={viewDetailsLabel}
                  imageAspect="4 / 3"
                  className="h-full shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                />
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
