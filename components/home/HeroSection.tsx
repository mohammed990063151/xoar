"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroSceneLazy } from "@/components/three/HeroSceneLazy";
import { HeroSaudiBanner } from "@/components/home/HeroSaudiBanner";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
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
  return (
    <section className="relative overflow-hidden rounded-b-[2.5rem] border-b border-emerald-500/10">
      <HeroSaudiBanner locale={locale} />

      <div className="pointer-events-none absolute end-0 top-0 h-[min(520px,55vh)] w-[min(520px,90vw)] opacity-70 mix-blend-screen">
        <HeroSceneLazy />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
        <motion.div
          className="max-w-2xl space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            variants={item}
          >
            <span className="block text-white">{hero.title}</span>
            <span className="gradient-text-saudi">{hero.titleHighlight}</span>{" "}
            <span className="text-white">{hero.titleEnd}</span>
          </motion.h1>
          <motion.p
            className="max-w-xl text-base text-slate-200/95 sm:text-lg"
            variants={item}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4"
            variants={item}
          >
            <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={localizedPath(locale, "/services")}
                className="pointer-events-auto relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-emerald-700 via-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-900/40"
              >
                <motion.span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: "-120%" }}
                  animate={{ x: ["120%", "-120%"] }}
                  transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                />
                <span className="relative z-10">{hero.primaryCta}</span>
                <span className="relative z-10" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localizedPath(locale, "/events")}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/5 px-5 py-3 text-sm font-medium text-amber-50/95 backdrop-blur-sm transition hover:border-emerald-400/50 hover:text-emerald-100"
              >
                {hero.secondaryCta}
                <span aria-hidden>→</span>
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.div
          className="pointer-events-auto relative ms-auto hidden flex-col items-center gap-3 lg:flex"
          initial={{ opacity: 0, scale: 0.75, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 18 }}
        >
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center rounded-full border border-emerald-400/30 bg-gradient-to-br from-emerald-950/60 to-violet-950/50 text-white shadow-[0_0_40px_rgba(16,185,129,0.25)] backdrop-blur-md"
            animate={{ boxShadow: ["0 0 28px rgba(16,185,129,0.2)", "0 0 48px rgba(168,85,247,0.35)", "0 0 28px rgba(16,185,129,0.2)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="text-2xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              ✦
            </motion.span>
            <motion.span
              className="absolute inset-2 rounded-full border border-amber-300/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <span className="max-w-[10rem] text-center text-xs text-emerald-100/80">
            {locale === "ar" ? "هوية فعاليات سعودية" : "Saudi event identity"}
          </span>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#05050c] to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </section>
  );
}
