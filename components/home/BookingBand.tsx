"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { BookButton } from "@/components/ui/BookButton";
import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

interface BookingBandProps {
  readonly locale: Locale;
  readonly booking: Dictionary["booking"];
  readonly formCta: string;
}

export function BookingBand({
  locale,
  booking,
  formCta,
}: BookingBandProps): React.ReactElement {
  return (
    <section
      className={cn(
        siteContainer,
        "relative overflow-hidden rounded-3xl border border-emerald-500/20 py-16",
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-l from-violet-900/50 via-emerald-950/40 to-cyan-900/35"
        animate={{ opacity: [0.88, 1, 0.9, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -start-32 top-1/2 h-[140%] w-[50%] -translate-y-1/2 rounded-full bg-gradient-to-b from-amber-400/20 via-transparent to-emerald-500/15 blur-3xl"
        animate={{ rotate: [0, 8, 0], opacity: [0.4, 0.7, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-35" />
      <ScrollReveal className="relative mx-auto max-w-3xl px-2 text-center sm:px-6">
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {booking.title}
        </motion.h2>
        <motion.p
          className="mt-4 text-slate-100/90"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.55 }}
        >
          {booking.subtitle}
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.55 }}
        >
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={localizedPath(locale, "/activities")}
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30"
            >
              {booking.cta}
            </Link>
          </motion.span>
          <motion.span whileHover={{ scale: 1.04 }}>
            <BookButton
              type="booking"
              source="home-booking-band"
              className="inline-flex rounded-full border border-emerald-300/40 px-5 py-2.5 text-sm font-medium text-emerald-50 backdrop-blur-sm transition hover:bg-emerald-500/15"
            >
              {formCta}
            </BookButton>
          </motion.span>
        </motion.div>
        <p className="mt-6 text-xs text-slate-200/80">{booking.note}</p>
      </ScrollReveal>
    </section>
  );
}
