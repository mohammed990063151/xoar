"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { normalizeStorageImageUrl, useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";

interface ShowcaseGallerySliderProps {
  readonly images: readonly string[];
  readonly locale: Locale;
  readonly title: string;
  readonly emptyHint?: string;
  readonly className?: string;
  readonly autoplayMs?: number;
}

type SlideRole = "prev" | "active" | "next";

const SWIPE_THRESHOLD = 56;
const VELOCITY_THRESHOLD = 380;

function slideIndices(active: number, count: number): Array<{ index: number; role: SlideRole }> {
  if (count <= 0) return [];
  if (count === 1) return [{ index: 0, role: "active" }];
  if (count === 2) {
    const other = active === 0 ? 1 : 0;
    return [
      { index: other, role: "prev" },
      { index: active, role: "active" },
    ];
  }
  const prev = (active - 1 + count) % count;
  const next = (active + 1) % count;
  return [
    { index: prev, role: "prev" },
    { index: active, role: "active" },
    { index: next, role: "next" },
  ];
}

export function ShowcaseGallerySlider({
  images,
  locale,
  title,
  emptyHint,
  className,
  autoplayMs = 4500,
}: ShowcaseGallerySliderProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ar = locale === "ar";
  const slides = useMemo(
    () =>
      images
        .map((src) => normalizeStorageImageUrl(src))
        .filter((src) => Boolean(src)),
    [images],
  );
  const slidesKey = slides.join("|");

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => {
    if (count === 0) return;
    setActive((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    if (count === 0) return;
    setActive((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    setActive(0);
  }, [slidesKey]);

  useEffect(() => {
    if (reduceMotion || count < 2 || autoplayMs <= 0 || paused || lightbox) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplayMs, count, lightbox, paused, reduceMotion]);

  useEffect(() => {
    const thumb = thumbRefs.current[active];
    thumb?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") (ar ? goPrev : goNext)();
      if (event.key === "ArrowLeft") (ar ? goNext : goPrev)();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, ar, goNext, goPrev]);

  const resolveSwipe = useCallback(
    (offsetX: number, velocityX: number) => {
      const swipe = ar ? -offsetX : offsetX;
      const velocity = ar ? -velocityX : velocityX;
      if (swipe > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) goPrev();
      else if (swipe < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) goNext();
    },
    [ar, goNext, goPrev],
  );

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      resolveSwipe(info.offset.x, info.velocity.x);
      setDragX(0);
      setPaused(false);
    },
    [resolveSwipe],
  );

  const labels = {
    expand: ar ? "تكبير المعرض" : "Expand gallery",
    close: ar ? "إغلاق" : "Close",
    prev: ar ? "السابقة" : "Previous",
    next: ar ? "التالية" : "Next",
    drag: ar ? "اسحب للتنقل بين الصور" : "Drag to browse images",
    filmstrip: ar ? "معرض الصور" : "Image gallery",
    empty:
      emptyHint ??
      (ar ? "أضف صورة من لوحة التحكم" : "Add an image from the dashboard"),
  };

  if (count === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-sm text-slate-500 sm:min-h-[360px] lg:min-h-[420px]",
          className,
        )}
      >
        {labels.empty}
      </div>
    );
  }

  const visible = slideIndices(active, count);
  const current = slides[active] ?? "";
  const canDrag = count > 1 && !reduceMotion;

  return (
    <div className={cn("relative w-full", className)} dir={ar ? "rtl" : "ltr"}>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className={cn(
            "relative touch-pan-y select-none",
            canDrag ? "cursor-grab active:cursor-grabbing" : "",
          )}
          drag={canDrag ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragStart={() => {
            setPaused(true);
            setDragX(0);
          }}
          onDrag={(_, info) => setDragX(info.offset.x)}
          onDragEnd={onDragEnd}
          style={{ x: canDrag ? dragX : 0 }}
        >
          <div className="relative flex h-[240px] items-stretch justify-center gap-2 sm:h-[320px] sm:gap-3 md:h-[380px] lg:h-[440px] lg:gap-4">
            {visible.map(({ index, role }) => {
              const src = slides[index];
              const isActive = role === "active";

              return (
                <motion.div
                  key={`${index}-${role}`}
                  layout={false}
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0.55,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-xl border bg-slate-950 shadow-lg sm:rounded-2xl",
                    isActive
                      ? "z-10 w-[58%] border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:w-[54%]"
                      : "z-0 w-[21%] border-white/8 sm:w-[20%]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) setLightbox(true);
                      else goTo(index);
                    }}
                    className={cn(
                      "relative block h-full w-full",
                      isActive ? "cursor-zoom-in" : "cursor-pointer hover:opacity-90",
                    )}
                    aria-label={isActive ? labels.expand : `${title} ${index + 1}`}
                  >
                    <Image
                      src={src}
                      alt={isActive ? title : ""}
                      fill
                      priority={isActive && active === 0}
                      className="object-cover pointer-events-none"
                      sizes={
                        isActive
                          ? "(max-width: 768px) 58vw, 42vw"
                          : "(max-width: 768px) 21vw, 16vw"
                      }
                      unoptimized={useUnoptimizedImage(src)}
                      draggable={false}
                    />
                    {isActive ? (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/35 via-transparent to-transparent" />
                    ) : null}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute start-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-lg text-slate-800 shadow-lg transition hover:bg-white sm:h-11 sm:w-11"
              aria-label={labels.prev}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute end-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/90 text-lg text-slate-800 shadow-lg transition hover:bg-white sm:h-11 sm:w-11"
              aria-label={labels.next}
            >
              ›
            </button>

            <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-1.5 sm:bottom-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    active === index
                      ? "w-7 bg-white"
                      : "w-2 bg-white/45 hover:bg-white/70",
                  )}
                  aria-label={`${title} ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <>
          <p className="mt-3 text-center text-xs text-slate-500">
            {active + 1} / {count}
            <span className="mx-2 opacity-40">·</span>
            {labels.drag}
          </p>

          <div className="mt-4">
            <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {labels.filmstrip}
            </p>
            <div
              ref={filmstripRef}
              className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25"
            >
              {slides.map((src, index) => (
                <button
                  key={`thumb-${src}-${index}`}
                  ref={(el) => {
                    thumbRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition sm:h-24 sm:w-32",
                    active === index
                      ? "border-cyan-400/80 ring-2 ring-cyan-400/35 opacity-100"
                      : "border-white/10 opacity-65 hover:opacity-100",
                  )}
                  aria-label={`${title} ${index + 1}`}
                  aria-current={active === index}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized={useUnoptimizedImage(src)}
                    draggable={false}
                  />
                  <span className="absolute bottom-1 end-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-[#020617]/97 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={labels.expand}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm font-medium text-slate-300">
                {title}
                {count > 1 ? (
                  <span className="ms-2 text-slate-500">
                    {active + 1} / {count}
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20"
                onClick={() => setLightbox(false)}
                aria-label={labels.close}
              >
                ×
              </button>
            </div>

            <motion.div
              className={cn(
                "relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-8",
                canDrag ? "cursor-grab active:cursor-grabbing" : "",
              )}
              drag={canDrag ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={onDragEnd}
            >
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute start-2 z-[101] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white sm:start-4"
                    aria-label={labels.prev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute end-2 z-[101] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white sm:end-4"
                    aria-label={labels.next}
                  >
                    ›
                  </button>
                </>
              ) : null}

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  className="relative max-h-[min(78vh,900px)] w-full max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                  initial={{ opacity: 0.4, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current}
                    alt={title}
                    className="mx-auto max-h-[min(78vh,900px)] w-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {count > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:gap-3">
                {slides.map((src, index) => (
                  <button
                    key={`lb-${src}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition sm:h-20 sm:w-28",
                      active === index
                        ? "border-cyan-400 ring-2 ring-cyan-400/40"
                        : "border-white/15 opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized={useUnoptimizedImage(src)}
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
