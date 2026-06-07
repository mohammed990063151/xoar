"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { HomeHero } from "@/lib/home-content";
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
  readonly hero: HomeHero;
}

export function HeroSection({
  locale,
  hero,
}: HeroSectionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const videoSrc = hero.videoUrl?.trim() || HERO_VIDEO_SRC;
  const posterSrc = hero.videoPoster?.trim() || HERO_VIDEO_POSTER;

  const orbs = reduceMotion
    ? []
    : [
        { className: "start-[8%] top-[18%] h-40 w-40 bg-violet-500/25 sm:h-56 sm:w-56", duration: 14 },
        { className: "end-[10%] top-[28%] h-36 w-36 bg-cyan-500/20 sm:h-44 sm:w-44", duration: 18 },
      ];

  return (
    <section className="relative min-h-[min(88dvh,680px)] overflow-hidden rounded-b-2xl border-b border-white/5 sm:min-h-[82vh] sm:rounded-b-[2.5rem] lg:min-h-[85vh]">
      {!reduceMotion
        ? orbs.map((orb) => (
            <motion.div
              key={orb.className}
              className={`pointer-events-none absolute rounded-full blur-3xl ${orb.className}`}
              aria-hidden
              animate={{
                y: [0, -18, 8, 0],
                x: [0, 12, -8, 0],
                scale: [1, 1.08, 0.96, 1],
              }}
              transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))
        : null}
      <div className="absolute inset-0">
        <video
          key={videoSrc}
          className="h-full w-full scale-105 object-cover object-center"
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={!reduceMotion}
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/65 to-[#020617]/35" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-transparent to-purple-950/35" />
      </div>

      <div className="hero-wave-lines pointer-events-none absolute inset-x-0 bottom-0 hidden h-32 opacity-80 sm:block sm:h-40">
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
        </svg>
      </div>

      <div
        className={cn(
          siteContainer,
          "relative z-[1] flex min-h-[min(88dvh,680px)] flex-col justify-end pb-24 pt-[4.75rem] sm:min-h-[82vh] sm:pb-16 sm:pt-28 lg:min-h-[85vh] lg:pb-20",
        )}
      >
        <motion.div
          className="w-full max-w-3xl space-y-4 sm:space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p
            className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-medium leading-snug text-cyan-100/90 backdrop-blur-md sm:px-4 sm:text-xs"
            variants={item}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {locale === "ar" ? "فعاليات · أنشطة · احتفالات" : "Events · Activities · Celebrations"}
          </motion.p>
          <motion.h1
            className="text-[clamp(1.65rem,6.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight text-white text-balance"
            variants={item}
          >
            <span className="block sm:inline">{hero.title}</span>{" "}
            <span className="gradient-text">{hero.titleHighlight}</span>{" "}
            <span className="text-white">{hero.titleEnd}</span>
          </motion.h1>
          <motion.p
            className="max-w-2xl text-sm leading-relaxed text-slate-200/95 sm:text-base md:text-lg"
            variants={item}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-0"
            variants={item}
          >
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href={localizedPath(locale, "/activities")}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110 sm:w-auto sm:px-7 sm:py-3.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3-3" strokeLinecap="round" />
                  </svg>
                </span>
                {hero.primaryCta}
                <span className="text-lg transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href={localizedPath(locale, "/events")}
                className="group inline-flex w-full items-center justify-center gap-2 py-1 text-sm font-medium text-slate-200 transition hover:text-white sm:w-auto sm:justify-start"
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
