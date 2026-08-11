"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import type { HomePartner, PartnersSectionCopy } from "@/lib/home-content";
import { isStorageImage } from "@/lib/image-url";
import { homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

interface PartnersMarqueeProps {
  readonly locale: Locale;
  readonly section: PartnersSectionCopy;
  readonly partners: readonly HomePartner[];
}

const CARD_ACCENTS = [
  "group-hover:border-violet-400/50 group-hover:shadow-[0_8px_32px_rgba(139,92,246,0.18)]",
  "group-hover:border-cyan-400/50 group-hover:shadow-[0_8px_32px_rgba(6,182,212,0.18)]",
  "group-hover:border-emerald-400/50 group-hover:shadow-[0_8px_32px_rgba(16,185,129,0.18)]",
  "group-hover:border-amber-400/50 group-hover:shadow-[0_8px_32px_rgba(245,158,11,0.18)]",
  "group-hover:border-rose-400/50 group-hover:shadow-[0_8px_32px_rgba(244,63,94,0.18)]",
];

const DOT_COLORS = [
  "bg-violet-400",
  "bg-cyan-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
];

function PartnerCard({
  partner,
  index,
}: {
  readonly partner: HomePartner;
  readonly index: number;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
  const dot = DOT_COLORS[index % DOT_COLORS.length];

  const inner = (
    <div className="relative flex h-full flex-col items-center justify-between gap-4 p-5 sm:p-6">
      {/* Corner dot pulse */}
      {!reduceMotion ? (
        <motion.span
          className={cn("absolute end-3 top-3 h-1.5 w-1.5 rounded-full", dot)}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.3 }}
          aria-hidden
        />
      ) : null}

      {/* Logo / image — fill + object-contain avoids Next.js width/height aspect warnings */}
      <div className="relative mx-auto h-[4.5rem] w-full max-w-[8rem] sm:h-20">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            fill
            sizes="128px"
            className="object-contain object-center opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-100"
            unoptimized={isStorageImage(partner.logo)}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm font-bold text-slate-300 transition group-hover:text-white">
            {partner.name}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-200 transition group-hover:text-white">
          {partner.name}
        </p>
        {partner.website ? (
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 transition group-hover:text-cyan-400/80">
            {partner.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
          </p>
        ) : null}
      </div>
    </div>
  );

  const motionBase = {
    initial: reduceMotion ? false : { opacity: 0, y: 28 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" as const },
    transition: { delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: reduceMotion ? undefined : { y: -6 },
  };

  const className = cn(
    "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all duration-300",
    accent,
  );

  if (partner.website) {
    return (
      <motion.a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...motionBase}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div className={className} {...motionBase}>
      {inner}
    </motion.div>
  );
}

export function PartnersMarquee({
  locale,
  section,
  partners,
}: PartnersMarqueeProps): React.ReactElement | null {
  if (partners.length === 0) return null;

  const eyebrow =
    section.eyebrow?.trim() || (locale === "ar" ? "شركاء النجاح" : "Trusted by");

  const lgCols =
    partners.length >= 5
      ? "lg:grid-cols-5"
      : partners.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  return (
    <section className={homeSection}>
      <div className={siteContainer}>
        {/* Header */}
        <SlideInEdge from="bottom" className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/90">
            {eyebrow}
          </p>
          <h2 className={cn("mt-2 gradient-text", homeSectionTitle)}>
            {section.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {section.subtitle}
          </p>
        </SlideInEdge>

        {/* Divider */}
        <div className="mx-auto mt-8 h-px max-w-xs bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        {/* Partners grid */}
        <div
          className={cn(
            "mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:gap-5",
            lgCols,
          )}
        >
          {partners.map((partner, index) => (
            <PartnerCard key={partner.id} partner={partner} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
