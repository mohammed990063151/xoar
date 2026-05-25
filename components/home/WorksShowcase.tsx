"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { ActivityCard, type ActivityCardData } from "@/components/ui/ActivityCard";
import { EventCard } from "@/components/ui/EventCard";
import type { HomeWork, OwnedActivitiesSectionCopy, WorksSectionCopy } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/lib/i18n";
import { gridCards3, homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

interface WorksShowcaseProps {
  readonly locale: Locale;
  readonly section: WorksSectionCopy;
  readonly works: readonly HomeWork[];
  readonly ownedActivitiesSection: OwnedActivitiesSectionCopy;
  readonly ownedActivities: readonly ActivityCardData[];
  readonly viewDetailsLabel: string;
  readonly viewAllWorksLabel: string;
  readonly bookCta: string;
  readonly viewAllActivitiesLabel: string;
}

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80";

export function WorksShowcase({
  locale,
  section,
  works,
  ownedActivitiesSection,
  ownedActivities,
  viewDetailsLabel,
  viewAllWorksLabel,
  bookCta,
  viewAllActivitiesLabel,
}: WorksShowcaseProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const eventsPath = localizedPath(locale, "/events");
  const activitiesPath = localizedPath(locale, "/activities");
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

        {(ownedActivities.length > 0 || ownedActivitiesSection.title) && (
          <div className="mt-24 border-t border-white/10 pt-16">
            <ScrollReveal>
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-start">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                    {locale === "ar" ? "أنشطة زورا" : "Xora activities"}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {ownedActivitiesSection.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-400">
                    {ownedActivitiesSection.subtitle}
                  </p>
                </div>
                <Link
                  href={activitiesPath}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
                >
                  {viewAllActivitiesLabel}
                  <span className="text-lg rtl:rotate-180" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            {ownedActivities.length === 0 ? (
              <p className="mt-12 text-center text-slate-500">
                {locale === "ar" ? "لا توجد أنشطة منشورة حالياً." : "No activities published yet."}
              </p>
            ) : (
              <div className={gridCards3}>
                {ownedActivities.map((activity) => (
                  <ScrollReveal key={activity.slug}>
                    <ActivityCard
                      locale={locale}
                      activity={activity}
                      bookCta={bookCta}
                      bookHref={`/activities/${activity.slug}#book`}
                      imageAspect="4 / 3"
                      className="h-full shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
