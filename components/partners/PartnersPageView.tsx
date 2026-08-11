"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { isStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import type { PartnerItem, PartnersPageContent } from "@/lib/site-page";
import { PartnerApplyModal } from "@/components/partners/PartnerApplyModal";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  siteContainer,
} from "@/lib/layout";

interface PartnersPageViewProps {
  readonly locale: Locale;
  readonly content: PartnersPageContent;
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
            ? "bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.14),transparent_50%)]"
            : "bg-gradient-to-b from-cyan-500/10 to-transparent",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "relative mx-auto w-full",
          featured ? "h-28 max-w-[12rem] sm:h-32 sm:max-w-[14rem]" : "h-20 max-w-[10rem] sm:h-24",
        )}
      >
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            fill
            sizes={featured ? "224px" : "160px"}
            className="object-contain object-center transition duration-500 group-hover:scale-110"
            unoptimized={isStorageImage(partner.logo)}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm font-bold text-slate-300">{partner.name}</span>
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
    whileHover: reduceMotion ? undefined : { y: -6, borderColor: "rgba(34, 211, 238, 0.45)" },
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
}: PartnersPageViewProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const light = useDocumentTheme() === "light";
  const ar = locale === "ar";
  const partners = content.partners;
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("apply") === "1") {
      setApplyOpen(true);
    }
  }, []);

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(34,211,238,0.18),transparent),radial-gradient(ellipse_50%_45%_at_10%_90%,rgba(16,185,129,0.12),transparent)]"
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
            <motion.button
              type="button"
              onClick={() => setApplyOpen(true)}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.25)]"
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              {ar ? "انضم كشريك" : "Become a partner"}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {content.stats.length > 0 ? (
        <section className="border-y border-white/5 bg-white/[0.02] py-10 sm:py-12">
          <div className={cn(siteContainer, "grid gap-4 sm:grid-cols-3")}>
            {content.stats.map((stat, index) => (
              <motion.div
                key={`${stat.label}-${index}`}
                className="text-center"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
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
              {ar ? "سيتم عرض الشركاء قريباً." : "Partners will appear here soon."}
            </p>
          )}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className={siteContainer}>
          <motion.div
            className={cn(
              "relative overflow-hidden rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-14",
              light
                ? "border border-cyan-600/25 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                : "border border-cyan-400/20",
            )}
            style={{ backgroundColor: light ? "#ffffff" : "#071525" }}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className={
                light
                  ? "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_60%)]"
                  : "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_60%)]"
              }
              aria-hidden
            />
            <div className="relative">
              <h2
                className="text-[clamp(1.25rem,4vw,1.875rem)] font-bold tracking-tight sm:text-3xl"
                style={light ? { color: "#0f172a" } : { color: "#ffffff" }}
              >
                {content.closing.title}
              </h2>
              <p
                className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base"
                style={light ? { color: "#475569" } : { color: "#94a3b8" }}
              >
                {content.closing.text}
              </p>
              <button
                type="button"
                onClick={() => setApplyOpen(true)}
                className={cn(
                  "mt-6 inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition",
                  light
                    ? "border-cyan-600/40 bg-cyan-50 hover:border-cyan-600/60 hover:bg-cyan-100"
                    : "border-cyan-400/40 bg-cyan-500/10 hover:border-cyan-300/60 hover:bg-cyan-500/20",
                )}
                style={light ? { color: "#0e7490" } : { color: "#ffffff" }}
              >
                {ar ? "قدّم طلب الشراكة" : "Apply to partner"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <PartnerApplyModal open={applyOpen} locale={locale} onClose={() => setApplyOpen(false)} />
    </div>
  );
}
