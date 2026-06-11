"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { isStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { PartnerItem, PartnersPageContent } from "@/lib/site-page";
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

interface PartnersPageViewProps {
  readonly locale: Locale;
  readonly content: PartnersPageContent;
  readonly contactCta: string;
}

function PartnerLogoCard({
  partner,
  index,
  featured,
}: {
  readonly partner: PartnerItem;
  readonly index: number;
  readonly featured: boolean;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();

  const inner = (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100",
          featured
            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.18),transparent_50%)]"
            : "bg-gradient-to-b from-violet-500/10 to-transparent",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "relative flex w-full items-center justify-center",
          featured ? "h-28 sm:h-32" : "h-20 sm:h-24",
        )}
      >
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={160}
            height={80}
            className="max-h-full w-auto max-w-[85%] object-contain transition duration-500 group-hover:scale-110"
            unoptimized={isStorageImage(partner.logo)}
          />
        ) : (
          <span className="text-sm font-bold text-slate-300">{partner.name}</span>
        )}
      </div>
      <p className="relative mt-3 text-center text-xs font-medium text-slate-500 transition group-hover:text-cyan-200/90">
        {partner.name}
      </p>
    </>
  );

  const className = cn(
    "group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-5 backdrop-blur-sm transition duration-500",
    featured && "sm:col-span-2 sm:row-span-2 sm:p-8",
  );

  const motionProps = {
    className,
    initial: reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-40px" as const },
    transition: { delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: reduceMotion ? undefined : { y: -6, borderColor: "rgba(168, 85, 247, 0.45)" },
  };

  if (partner.website) {
    return (
      <motion.a href={partner.website} target="_blank" rel="noopener noreferrer" {...motionProps}>
        {inner}
      </motion.a>
    );
  }

  return <motion.div {...motionProps}>{inner}</motion.div>;
}

export function PartnersPageView({
  locale,
  content,
  contactCta,
}: PartnersPageViewProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const contactPath = localizedPath(locale, "/contact");
  const partners = content.partners;

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.2),transparent),radial-gradient(ellipse_50%_45%_at_10%_90%,rgba(168,85,247,0.14),transparent)]"
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

      {content.stats.length > 0 ? (
        <section className="border-y border-white/5 bg-white/[0.02] py-10 sm:py-12">
          <div className={cn(siteContainer, "grid gap-4 sm:grid-cols-3")}>
            {content.stats.map((stat, index) => (
              <motion.div
                key={`${stat.label}-${index}`}
                className="gradient-border text-center"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="inner px-4 py-6 sm:py-8">
                  <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="py-12 sm:py-16 lg:py-20">
        <div className={siteContainer}>
          {partners.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {partners.map((partner, index) => (
                <PartnerLogoCard
                  key={partner.id}
                  partner={partner}
                  index={index}
                  featured={index === 0 && partners.length >= 4}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400">
              {locale === "ar" ? "سيتم عرض الشركاء قريباً." : "Partners will appear here soon."}
            </p>
          )}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className={siteContainer}>
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-slate-900/90 via-slate-950 to-indigo-950/80 px-6 py-10 text-center sm:px-10 sm:py-14"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_60%)]"
              aria-hidden
            />
            <div className="relative">
              <h2 className={sectionHeading}>{content.closing.title}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                {content.closing.text}
              </p>
              <Link
                href={contactPath}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-violet-300/60 hover:bg-violet-500/20"
              >
                {contactCta}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
