"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

const HERO_VIDEO_SRC =
  "https://videos.pexels.com/video-files/19679435/19679435-hd_1920_1080_25fps.mp4";

const HERO_VIDEO_POSTER =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface HeroSectionProps {
  readonly locale: Locale;
  readonly hero: Dictionary["hero"];
}

export function HeroSection({
  locale,
  hero,
}: HeroSectionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[78vh] overflow-hidden rounded-b-[2rem] border-b border-white/5 sm:min-h-[82vh] sm:rounded-b-[2.5rem]">
      <div className="absolute inset-0">
        <video
          className="h-full w-full scale-105 object-cover object-center"
          poster={HERO_VIDEO_POSTER}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={!reduceMotion}
          aria-hidden
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-[#020617]/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-transparent to-purple-950/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/15 via-transparent to-blue-950/25" />
      </div>

      <div className="hero-wave-lines pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-80">
        <svg
          className="h-full w-full text-purple-500/35"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="heroWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            fill="none"
            stroke="url(#heroWaveGrad)"
            strokeWidth="2"
            d="M0,90 C180,40 360,110 540,70 C720,30 900,100 1080,60 C1260,20 1380,80 1440,50"
          />
          <path
            fill="none"
            stroke="url(#heroWaveGrad)"
            strokeWidth="1.2"
            opacity="0.6"
            d="M0,100 C200,55 400,115 600,75 C800,35 1000,105 1200,65 C1320,45 1400,90 1440,70"
          />
        </svg>
      </div>

      <div
        className={cn(
          siteContainer,
          "relative z-[1] flex min-h-[78vh] flex-col justify-end pb-16 pt-28 sm:min-h-[82vh] sm:pb-20",
        )}
      >
        <motion.div
          className="max-w-3xl space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
            variants={item}
          >
            <span className="block sm:inline">{hero.title}</span>{" "}
            <span className="gradient-text">{hero.titleHighlight}</span>{" "}
            <span className="text-white">{hero.titleEnd}</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl text-base leading-relaxed text-slate-200/95 sm:text-lg"
            variants={item}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div className="flex flex-wrap items-center gap-4 sm:gap-5" variants={item}>
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localizedPath(locale, "/services")}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)]"
              >
                {hero.primaryCta}
                <span className="text-lg rtl:rotate-180" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localizedPath(locale, "/events")}
                className="group inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-white"
              >
                {hero.secondaryCta}
                <span className="transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
