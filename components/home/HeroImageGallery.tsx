"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

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
    expand: locale === "ar" ? "تكبير الصورة" : "Enlarge image",
    close: locale === "ar" ? "إغلاق" : "Close",
    prev: locale === "ar" ? "السابقة" : "Previous",
    next: locale === "ar" ? "التالية" : "Next",
  };

  return (
    <section className={homeSection} aria-label={copy.title}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(59,130,246,0.1),transparent_55%),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(168,85,247,0.08),transparent)]"
        aria-hidden
      />

      <div className={siteContainer}>
        <SlideInEdge from={locale === "ar" ? "end" : "start"} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
            {copy.eyebrow}
          </p>
          <h2 className={`mt-3 ${homeSectionTitle}`}>
            {copy.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">{copy.subtitle}</p>
        </SlideInEdge>

        <SlideInEdge from="bottom" delay={0.1} className="relative mx-auto mt-12 max-w-5xl sm:mt-14">
          <div className="gradient-border shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="inner overflow-hidden p-2 sm:p-3">
              <AccordionImageGallery
                images={normalized}
                locale={locale}
                title={copy.title}
                activeIndex={activeIndex}
                onActiveChange={setActiveIndex}
                variant="dark"
                showCaption={false}
                autoplay={count > 1}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            >
              {labels.expand}
            </button>
          </div>
        </SlideInEdge>
      </div>

      <AnimatePresence>
        {lightboxOpen && activeSrc ? (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute start-3 top-1/2 z-[101] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white sm:flex"
                  aria-label={labels.prev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute end-3 top-1/2 z-[101] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white sm:flex"
                  aria-label={labels.next}
                >
                  ›
                </button>
              </>
            ) : null}
            <motion.div
              className="relative max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/12 bg-black/30"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeSrc} alt="" className="max-h-[88vh] w-full object-contain" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
