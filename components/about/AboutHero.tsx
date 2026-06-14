"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { pageEyebrow, siteContainer } from "@/lib/layout";

interface AboutHeroProps {
  readonly locale: "ar" | "en";
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly accentImage?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function AboutHero({
  locale,
  eyebrow,
  title,
  intro,
  accentImage,
}: AboutHeroProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ar = locale === "ar";

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      {accentImage ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={accentImage}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-[0.18] blur-2xl"
          />
        </div>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(168,85,247,0.35),transparent),radial-gradient(ellipse_60%_50%_at_0%_80%,rgba(6,182,212,0.2),transparent),radial-gradient(ellipse_55%_45%_at_100%_60%,rgba(59,130,246,0.18),transparent)]"
        aria-hidden
      />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      {!reduceMotion ? (
        <>
          <motion.div
            className="pointer-events-none absolute start-[6%] top-[20%] h-48 w-48 rounded-full bg-violet-500/20 blur-3xl sm:h-64 sm:w-64"
            animate={{ y: [0, -24, 12, 0], scale: [1, 1.12, 0.94, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute end-[8%] top-[35%] h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl sm:h-52 sm:w-52"
            animate={{ y: [0, 18, -10, 0], x: [0, -14, 8, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        </>
      ) : null}

      <div className={cn(siteContainer, "relative py-14 sm:py-16 lg:py-20")}>
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
          }}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                {!reduceMotion ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                ) : null}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {eyebrow ? (
                <span className={pageEyebrow}>{eyebrow}</span>
              ) : (
                <span className={pageEyebrow}>
                  {ar ? "تعرّف على زورا" : "Meet Xora"}
                </span>
              )}
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 text-[clamp(2rem,7vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white text-balance"
            variants={fadeUp}
          >
            {title.split(" ").length > 1 ? (
              <>
                <span className="block sm:inline">{title.split(" ").slice(0, -1).join(" ")} </span>
                <span className="gradient-text">{title.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="gradient-text">{title}</span>
            )}
          </motion.h1>

          {intro ? (
            <motion.p
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl"
              variants={fadeUp}
            >
              {intro}
            </motion.p>
          ) : null}

          <motion.div
            className="mx-auto mt-8 h-px max-w-xs animate-header-line opacity-70"
            variants={fadeUp}
            aria-hidden
          />
        </motion.div>
      </div>
    </section>
  );
}
