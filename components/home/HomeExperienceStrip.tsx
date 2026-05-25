"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface HomeExperienceStripProps {
  readonly locale: Locale;
  readonly eyebrow: string;
  readonly title: string;
  readonly items: readonly string[];
}

export function HomeExperienceStrip({
  locale,
  eyebrow,
  title,
  items,
}: HomeExperienceStripProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ar = locale === "ar";

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-slate-950/80 py-14 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(99,102,241,0.06) 0, rgba(99,102,241,0.06) 1px, transparent 1px, transparent 48px)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
              <Link
                href={localizedPath(locale, "/activities")}
                className="rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-95"
              >
                {ar ? "استكشف الأنشطة" : "Explore activities"}
              </Link>
              <Link
                href={localizedPath(locale, "/events")}
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                {ar ? "أعمالنا" : "Our work"}
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {items.map((label, index) => (
            <motion.span
              key={label}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.07,
                type: "spring",
                stiffness: 320,
                damping: 22,
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.06, borderColor: "rgba(34,211,238,0.45)" }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
