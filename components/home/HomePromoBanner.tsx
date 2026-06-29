"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { HomePromoSlide } from "@/lib/home-content";
import type { Locale } from "@/lib/i18n";
import { siteContainer } from "@/lib/layout";

interface HomePromoBannerProps {
  readonly locale: Locale;
  readonly slides: readonly HomePromoSlide[];
}

const RING_RADIUS = 10;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function StoryProgressRing({
  durationMs,
  slideKey,
  paused,
  reduceMotion,
}: {
  durationMs: number;
  slideKey: string;
  paused: boolean;
  reduceMotion: boolean;
}): React.ReactElement {
  return (
    <svg
      className="h-7 w-7 -rotate-90"
      viewBox="0 0 28 28"
      aria-hidden
    >
      <circle
        cx="14"
        cy="14"
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      <motion.circle
        key={slideKey}
        cx="14"
        cy="14"
        r={RING_RADIUS}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        initial={{ strokeDashoffset: reduceMotion ? 0 : RING_CIRCUMFERENCE }}
        animate={{ strokeDashoffset: 0 }}
        transition={
          reduceMotion || paused
            ? { duration: 0 }
            : { duration: durationMs / 1000, ease: "linear" }
        }
        style={{ animationPlayState: paused ? "paused" : "running" }}
      />
    </svg>
  );
}

function CalendarIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-90" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function HomePromoBanner({
  locale,
  slides,
}: HomePromoBannerProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion() ?? false;
  const ar = locale === "ar";
  const items = useMemo(
    () => slides.filter((slide) => slide.image.trim() !== "" && slide.title.trim() !== ""),
    [slides],
  );
  const count = items.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  const current = items[index] ?? items[0];
  const durationMs = (current?.durationSeconds ?? 6) * 1000;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setTick((value) => value + 1);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;

    const id = window.setTimeout(goNext, durationMs);
    return () => window.clearTimeout(id);
  }, [count, paused, reduceMotion, durationMs, index, tick, goNext]);

  if (count === 0) return null;

  const labels = {
    prev: ar ? "السابق" : "Previous",
    next: ar ? "التالي" : "Next",
    banner: ar ? "عروض مميزة" : "Featured offers",
  };

  const isExternal = /^https?:\/\//i.test(current.href);

  const bannerInner = (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${current.id}-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={current.image}
            alt=""
            fill
            unoptimized={useUnoptimizedImage(current.image)}
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 88rem"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-transparent rtl:bg-gradient-to-r" />

      <div className="pointer-events-none absolute start-4 top-4 z-20 flex items-center gap-2 sm:start-5 sm:top-5">
        {count > 1 ? (
          <StoryProgressRing
            slideKey={`${current.id}-${index}-${tick}`}
            durationMs={durationMs}
            paused={paused}
            reduceMotion={reduceMotion}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 pb-4 pt-20 text-center sm:items-end sm:px-8 sm:pb-7 sm:pt-16 sm:text-end">
        <h2 className="max-w-[min(100%,20rem)] text-[clamp(0.95rem,4.2vw,1.65rem)] font-bold leading-snug text-white text-balance sm:max-w-xl">
          {current.title}
        </h2>
        {current.subtitle ? (
          <p className="mt-1.5 flex items-center justify-center gap-2 text-xs text-white/90 sm:mt-2 sm:justify-end sm:text-sm">
            <CalendarIcon />
            <span>{current.subtitle}</span>
          </p>
        ) : null}
      </div>

      {isExternal ? (
        <a
          href={current.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-[15]"
          aria-label={current.title}
        />
      ) : (
        <Link href={current.href} className="absolute inset-0 z-[15]" aria-label={current.title} />
      )}

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute start-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white text-sm font-semibold text-black shadow-lg transition hover:scale-105 sm:start-4 sm:h-10 sm:w-10 sm:text-base"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goPrev();
            }}
            aria-label={labels.prev}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute end-2 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white text-sm font-semibold text-black shadow-lg transition hover:scale-105 sm:end-4 sm:h-10 sm:w-10 sm:text-base"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              goNext();
            }}
            aria-label={labels.next}
          >
            ›
          </button>
        </>
      ) : null}
    </>
  );

  return (
    <section className="relative w-full py-4 sm:py-8" aria-label={labels.banner}>
      <div className={siteContainer}>
        <div
          className={cn(
            "group relative aspect-[5/4] min-h-[200px] max-h-[min(72vw,360px)] overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:aspect-[16/7] sm:max-h-none sm:min-h-[240px] sm:rounded-3xl lg:aspect-[16/6] lg:min-h-[280px]",
          )}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {bannerInner}
        </div>
      </div>
    </section>
  );
}
