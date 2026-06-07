"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ActivityCard, type ActivityCardData } from "@/components/ui/ActivityCard";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { gridCards3, homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

export interface EntertainmentSectionCopy {
  readonly title: string;
  readonly subtitle: string;
}

interface EntertainmentActivitiesSectionProps {
  readonly locale: Locale;
  readonly section: EntertainmentSectionCopy;
  readonly activities: readonly ActivityCardData[];
  readonly bookCta: string;
}

export function EntertainmentActivitiesSection({
  locale,
  section,
  activities,
  bookCta,
}: EntertainmentActivitiesSectionProps): React.ReactElement {
  const activitiesPath = localizedPath(locale, "/activities");
  const ar = locale === "ar";

  return (
    <section className={homeSection} id="entertainment-activities">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(168,85,247,0.12),transparent)]"
        aria-hidden
      />
      <div className={siteContainer}>
        <ScrollReveal>
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-start">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
                {ar ? "استكشف" : "Explore"}
              </p>
              <h2 className={`mt-2 ${homeSectionTitle}`}>{section.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">{section.subtitle}</p>
            </div>
            <Link
              href={activitiesPath}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-100 transition hover:border-violet-400/50 hover:bg-violet-500/20"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/40" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
              </span>
              {ar ? "استكشف الأنشطة الترفيهية" : "Explore entertainment"}
              <span className="text-lg rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </ScrollReveal>

        {activities.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">
            {ar ? "لا توجد أنشطة منشورة حالياً." : "No activities published yet."}
          </p>
        ) : (
          <div className={`${gridCards3} mt-10 sm:mt-14`}>
            {activities.map((activity) => (
              <ScrollReveal key={activity.slug}>
                <ActivityCard
                  locale={locale}
                  activity={activity}
                  bookCta={bookCta}
                  bookHref={`/activities/${activity.slug}#book`}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
