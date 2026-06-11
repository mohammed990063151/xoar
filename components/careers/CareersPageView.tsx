"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { CareersPageContent, JobPostingItem } from "@/lib/site-page";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionHeading,
  siteContainer,
} from "@/lib/layout";

interface CareersPageViewProps {
  readonly locale: Locale;
  readonly content: CareersPageContent;
}

function jobApplyHref(job: JobPostingItem): string | null {
  if (job.applyUrl) return job.applyUrl;
  if (job.applyEmail) return `mailto:${job.applyEmail}?subject=${encodeURIComponent(job.title)}`;
  return null;
}

function JobCard({
  job,
  index,
  applyCta,
  locale,
}: {
  readonly job: JobPostingItem;
  readonly index: number;
  readonly applyCta: string;
  readonly locale: Locale;
}): React.ReactElement {
  const [open, setOpen] = useState(index === 0);
  const reduceMotion = useReducedMotion();
  const applyHref = jobApplyHref(job);
  const ar = locale === "ar";

  return (
    <motion.article
      className="gradient-border overflow-hidden"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="inner p-0">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 p-5 text-start sm:p-6"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {job.employmentTypeLabel ? (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                  {job.employmentTypeLabel}
                </span>
              ) : null}
              {job.department ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                  {job.department}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-lg font-bold text-white sm:text-xl">{job.title}</h3>
            {job.location ? (
              <p className="mt-1 text-sm text-slate-400">{job.location}</p>
            ) : null}
            {job.summary ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{job.summary}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition",
              open && "rotate-180 border-violet-400/40 bg-violet-500/10 text-white",
            )}
            aria-hidden
          >
            ▾
          </span>
        </button>

        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="space-y-4 border-t border-white/5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {job.description ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300/90">
                  {ar ? "الوصف" : "Description"}
                </h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">
                  {job.description}
                </p>
              </div>
            ) : null}
            {job.requirements ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300/90">
                  {ar ? "المتطلبات" : "Requirements"}
                </h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">
                  {job.requirements}
                </p>
              </div>
            ) : null}
            {applyHref ? (
              <a
                href={applyHref}
                target={job.applyUrl ? "_blank" : undefined}
                rel={job.applyUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110"
              >
                {applyCta}
              </a>
            ) : null}
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export function CareersPageView({
  locale,
  content,
}: CareersPageViewProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const contactPath = localizedPath(locale, "/contact");

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_-5%,rgba(99,102,241,0.22),transparent),radial-gradient(ellipse_45%_40%_at_95%_70%,rgba(6,182,212,0.12),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {content.eyebrow ? <p className={pageEyebrow}>{content.eyebrow}</p> : null}
            <h1 className={pageTitle}>{content.title}</h1>
            <p className={pageIntro}>{content.intro}</p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-12 sm:py-16">
        <div className={cn(siteContainer, "grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center")}>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: locale === "ar" ? 24 : -24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={sectionHeading}>{content.culture.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
              {content.culture.text}
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {content.benefits.map((benefit, index) => (
              <motion.div
                key={`${benefit.title}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-sm"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <p className="text-sm font-bold text-white">{benefit.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className={cn(siteContainer, "max-w-4xl")}>
          <h2 className={`mb-6 text-center ${sectionHeading}`}>{content.openRoles}</h2>
          {content.jobs.length > 0 ? (
            <div className="space-y-4">
              {content.jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  applyCta={content.applyCta}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400">{content.noJobs}</p>
          )}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className={cn(siteContainer, "max-w-3xl")}>
          <motion.div
            className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-cyan-950/20 px-6 py-10 text-center sm:px-10"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold text-white sm:text-2xl">{content.closing.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              {content.closing.text}
            </p>
            <Link
              href={contactPath}
              className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:text-cyan-100"
            >
              {locale === "ar" ? "تواصل معنا" : "Contact us"}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
