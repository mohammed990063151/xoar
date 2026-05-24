"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/cn";
import { isStorageImage, normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";

export interface HeroGalleryCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
}

interface HeroImageGalleryProps {
  readonly locale: Locale;
  readonly images: readonly string[];
  readonly copy: HeroGalleryCopy;
}

const AUTOPLAY_MS = 5500;

function ChevronIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ExpandIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

export function HeroImageGallery({
  locale,
  images,
  copy,
}: HeroImageGalleryProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion();
  const normalized = useMemo(
    () => images.map((src) => normalizeStorageImageUrl(src)).filter(Boolean),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = normalized.length;
  const activeSrc = normalized[activeIndex] ?? "";

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (reduceMotion || paused || count <= 1) return;
    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, count, goNext]);

  useEffect(() => {
    if (activeIndex >= count && count > 0) setActiveIndex(0);
  }, [activeIndex, count]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goNext, goPrev]);

  if (count === 0) return null;

  const labels = {
    prev: locale === "ar" ? "السابقة" : "Previous",
    next: locale === "ar" ? "التالية" : "Next",
    expand: locale === "ar" ? "تكبير الصورة" : "Enlarge image",
    close: locale === "ar" ? "إغلاق" : "Close",
    counter: locale === "ar" ? "صورة" : "Image",
  };

  return (
    <section className="relative py-16 sm:py-20" aria-label={copy.title}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(59,130,246,0.1),transparent_55%),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(168,85,247,0.08),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-400">{copy.subtitle}</p>
          </div>
        </ScrollReveal>

        <motion.div
          className="mx-auto mt-12 max-w-5xl sm:mt-14"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="gradient-border shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="inner overflow-hidden p-2 sm:p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(1.25rem-4px)] bg-slate-950">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeSrc}
                    className="absolute inset-0"
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={activeSrc}
                      alt=""
                      fill
                      priority={activeIndex === 0}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 960px"
                      unoptimized={isStorageImage(activeSrc)}
                    />
                  </motion.div>
                </AnimatePresence>

                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/75 via-[#020617]/10 to-transparent"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#020617]/30 via-transparent to-[#020617]/30"
                  aria-hidden
                />

                {count > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-white/30 hover:bg-black/60 sm:start-4 sm:h-11 sm:w-11"
                      aria-label={labels.prev}
                    >
                      <ChevronIcon className="h-5 w-5 rtl:rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition hover:border-white/30 hover:bg-black/60 sm:end-4 sm:h-11 sm:w-11"
                      aria-label={labels.next}
                    >
                      <ChevronIcon className="h-5 w-5 rotate-180 rtl:rotate-0" />
                    </button>
                  </>
                ) : null}

                <div className="absolute bottom-3 start-3 end-3 z-10 flex items-end justify-between gap-3 sm:bottom-4 sm:start-4 sm:end-4">
                  <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                    {activeIndex + 1} / {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:bg-black/65"
                    aria-label={labels.expand}
                  >
                    <ExpandIcon />
                  </button>
                </div>
              </div>

              {count > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {normalized.map((src, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "relative h-[4.5rem] w-[6.5rem] shrink-0 overflow-hidden rounded-xl border-2 transition duration-300 sm:h-20 sm:w-[7.5rem]",
                          isActive
                            ? "border-cyan-400/90 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                            : "border-transparent opacity-55 hover:opacity-90",
                        )}
                        aria-label={`${labels.counter} ${index + 1}`}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="120px"
                          unoptimized={isStorageImage(src)}
                        />
                        {isActive ? (
                          <span
                            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {count > 1 && !reduceMotion ? (
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                animate={{ width: `${((activeIndex + 1) / count) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ) : null}
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/94 p-4 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={labels.expand}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute end-4 top-4 z-[101] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
              aria-label={labels.close}
            >
              ×
            </button>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  className="absolute start-3 top-1/2 z-[101] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white sm:flex"
                  aria-label={labels.prev}
                >
                  <ChevronIcon className="h-6 w-6 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  className="absolute end-3 top-1/2 z-[101] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white sm:flex"
                  aria-label={labels.next}
                >
                  <ChevronIcon className="h-6 w-6 rotate-180 rtl:rotate-0" />
                </button>
              </>
            ) : null}

            <motion.div
              className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/12 bg-black/30 shadow-[0_32px_100px_rgba(0,0,0,0.65)]"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(event) => event.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSrc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSrc}
                    alt=""
                    className="max-h-[88vh] w-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>
              <p className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                {activeIndex + 1} / {count}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
