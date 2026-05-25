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

function PartnerCard({
  partner,
  index,
}: {
  readonly partner: HomePartner;
  readonly index: number;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();

  const cardClass =
    "group relative flex min-h-[10.5rem] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-8 text-center backdrop-blur-sm sm:min-h-[11.5rem]";

  const inner = (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex h-16 w-full max-w-[8.5rem] items-center justify-center sm:h-[4.5rem]">
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={140}
            height={72}
            className="max-h-full w-auto max-w-full object-contain object-center transition duration-500 group-hover:scale-110"
            unoptimized={isStorageImage(partner.logo)}
          />
        ) : (
          <span className="text-sm font-semibold text-slate-300">{partner.name}</span>
        )}
      </div>
      <span className="relative text-xs font-medium text-slate-500 transition group-hover:text-cyan-200/90">
        {partner.name}
      </span>
      {!reduceMotion ? (
        <motion.span
          className="absolute end-4 top-4 h-2 w-2 rounded-full bg-cyan-400/80"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.25 }}
          aria-hidden
        />
      ) : null}
    </>
  );

  const motionProps = {
    className: cardClass,
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" as const },
    transition: { delay: index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: reduceMotion
      ? undefined
      : { y: -6, borderColor: "rgba(168, 85, 247, 0.4)" },
  };

  if (partner.website) {
    return (
      <motion.a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return <motion.div {...motionProps}>{inner}</motion.div>;
}

export function PartnersMarquee({
  locale,
  section,
  partners,
}: PartnersMarqueeProps): React.ReactElement | null {
  if (partners.length === 0) {
    return null;
  }

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
      <SlideInEdge from="bottom" className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/90">
          {eyebrow}
        </p>
        <h2 className={`mt-2 ${homeSectionTitle}`}>{section.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
          {section.subtitle}
        </p>
      </SlideInEdge>

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
