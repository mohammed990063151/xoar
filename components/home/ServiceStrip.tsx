"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";

interface ServiceStripProps {
  readonly data: Dictionary["servicesStrip"];
}

export function ServiceStrip({ data }: ServiceStripProps): React.ReactElement {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        className="pointer-events-none absolute -start-24 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -end-20 bottom-10 h-64 w-64 rounded-full bg-amber-400/10 blur-[90px]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <motion.h2
        className="relative text-center text-2xl font-bold sm:text-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="gradient-text-saudi">{data.title}</span>
      </motion.h2>

      <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data.cards.map((card, i) => (
          <motion.article
            key={card.title}
            className={cn(
              "gradient-border group h-full overflow-hidden",
              "shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-500",
              "hover:shadow-[0_0_40px_rgba(16,185,129,0.2),0_0_60px_rgba(167,139,250,0.15)]",
            )}
            initial={{ opacity: 0, y: 36, rotateZ: -1 }}
            whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{
              delay: i * 0.1,
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, rotateZ: 0.5 }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="inner relative flex h-full flex-col gap-3 p-5">
              <motion.div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/50 via-violet-500/40 to-cyan-400/35 shadow-lg shadow-emerald-500/20"
                whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
              />
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="flex-1 text-sm text-slate-400">{card.desc}</p>
              <motion.button
                type="button"
                className="text-start text-sm font-medium text-emerald-300/90 hover:text-cyan-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {card.cta} →
              </motion.button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
