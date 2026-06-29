"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { isYoutubeUrl } from "@/lib/video-embed";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";

export interface AccordionImageGalleryProps {
  readonly images: readonly string[];
  readonly locale: Locale;
  readonly title: string;
  readonly eyebrow?: string;
  readonly subtitle?: string;
  readonly activeIndex?: number;
  readonly onActiveChange?: (index: number) => void;
  readonly variant?: "dark" | "cream";
  readonly showCaption?: boolean;
  readonly autoplay?: boolean;
  readonly className?: string;
  /** Promo video as the last accordion panel (no separate gallery tab). */
  readonly videoUrl?: string | null;
}

const AUTOPLAY_MS = 5000;

export function AccordionImageGallery({
  images,
  locale,
  title,
  eyebrow,
  subtitle,
  activeIndex: controlledIndex,
  onActiveChange,
  variant = "dark",
  showCaption = true,
  autoplay = true,
  className,
  videoUrl,
}: AccordionImageGalleryProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion();
  const [internalIndex, setInternalIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : internalIndex;
  const setActive = useCallback(
    (index: number) => {
      if (!isControlled) setInternalIndex(index);
      onActiveChange?.(index);
    },
    [isControlled, onActiveChange],
  );

  const focusedIndex = hoveredIndex ?? activeIndex;
  const safeVideo =
    videoUrl && String(videoUrl).trim() !== "" ? String(videoUrl).trim() : null;
  const count = images.length + (safeVideo ? 1 : 0);
  const imageCount = images.length;

  useEffect(() => {
    if (activeIndex >= count && count > 0) {
      setActive(0);
    }
  }, [activeIndex, count, setActive]);

  useEffect(() => {
    if (reduceMotion || paused || !autoplay || count <= 1) return;
    const timer = window.setInterval(() => {
      setActive((activeIndex + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, autoplay, count, activeIndex, setActive]);

  if (count === 0) return null;

  const labels = {
    image: locale === "ar" ? "صورة" : "Image",
    video: locale === "ar" ? "فيديو" : "Video",
    of: locale === "ar" ? "من" : "of",
  };

  const isCream = variant === "cream";

  if (images.length === 0 && safeVideo) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          isCream ? "bg-[#fdf5f0] shadow-lg" : "border border-white/10 bg-slate-950",
          className,
        )}
      >
        <div className="relative aspect-[16/10] w-full min-h-[220px] sm:min-h-[320px]">
          {isYoutubeUrl(safeVideo) ? (
            <YoutubeEmbed videoUrl={safeVideo} title={title} className="h-full w-full" />
          ) : (
            <video
              src={safeVideo}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              title={title}
            />
          )}
        </div>
      </div>
    );
  }

  if (count === 1 && images.length === 1) {
    const src = images[0];
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          isCream ? "bg-[#fdf5f0] shadow-lg" : "border border-white/10 bg-slate-950",
          className,
        )}
      >
        <div className="relative aspect-[16/10] w-full min-h-[220px] sm:min-h-[320px]">
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={useUnoptimizedImage(src)}
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t",
              isCream ? "from-black/50 via-transparent" : "from-[#05050c]/80 via-transparent",
            )}
            aria-hidden
          />
          {showCaption ? (
            <div className="absolute bottom-4 start-4 end-4 text-white">
              {eyebrow ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {eyebrow}
                </p>
              ) : null}
              <p className="mt-1 text-xl font-bold sm:text-2xl">{title}</p>
              {subtitle ? <p className="mt-1 text-sm text-white/80">{subtitle}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setHoveredIndex(null);
      }}
    >
      {/* Mobile: single-slide carousel (accordion is too cramped on narrow screens) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl sm:hidden",
          isCream ? "bg-[#fdf5f0] shadow-lg" : "border border-white/10 bg-slate-950/90",
        )}
      >
        <div className="relative aspect-[4/3] min-h-[200px] w-full">
          {safeVideo && activeIndex === imageCount ? (
            <div className="absolute inset-0 bg-black">
              {isYoutubeUrl(safeVideo) ? (
                <YoutubeEmbed videoUrl={safeVideo} title={title} className="h-full w-full" />
              ) : (
                <video
                  src={safeVideo}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  title={title}
                />
              )}
            </div>
          ) : (
            <Image
              src={images[activeIndex] ?? images[0]}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={activeIndex === 0}
              unoptimized={useUnoptimizedImage(images[activeIndex] ?? images[0])}
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
            aria-hidden
          />
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setActive(activeIndex - 1)}
                className="absolute start-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/95 text-sm font-semibold text-black shadow"
                aria-label={locale === "ar" ? "السابقة" : "Previous"}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setActive(activeIndex + 1)}
                className="absolute end-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/95 text-sm font-semibold text-black shadow"
                aria-label={locale === "ar" ? "التالية" : "Next"}
              >
                ›
              </button>
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/40",
                    )}
                    aria-label={`${labels.image} ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "hidden h-[min(72vw,420px)] min-h-[240px] gap-2 overflow-hidden rounded-2xl p-2 sm:flex sm:h-[400px] sm:gap-2.5 sm:p-2.5",
          isCream ? "bg-[#fdf5f0]" : "border border-white/10 bg-slate-950/90",
        )}
        role="list"
        aria-label={title}
      >
        {images.map((src, index) => {
          const isFocused = index === focusedIndex;
          return (
            <motion.button
              key={`img-${src}-${index}`}
              type="button"
              role="listitem"
              layout={!reduceMotion}
              onClick={() => setActive(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              aria-label={`${labels.image} ${index + 1} ${labels.of} ${count}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                isCream ? "shadow-md" : "border border-white/5",
              )}
              initial={false}
              animate={{
                flex: isFocused ? 4.2 : 0.65,
                opacity: isFocused ? 1 : 0.72,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 220, damping: 28, mass: 0.8 }
              }
              style={{ minWidth: isFocused ? undefined : "3.25rem" }}
            >
              <Image
                src={src}
                alt=""
                fill
                className={cn(
                  "object-cover transition-transform duration-700",
                  isFocused ? "scale-100" : "scale-110",
                )}
                sizes={isFocused ? "(max-width:768px) 70vw, 50vw" : "80px"}
                priority={index === 0}
                unoptimized={useUnoptimizedImage(src)}
              />
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  isFocused
                    ? "bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-100"
                    : "bg-black/35 opacity-100",
                )}
                aria-hidden
              />
              {!isFocused ? (
                <span
                  className="absolute bottom-2 start-1/2 -translate-x-1/2 text-[10px] font-bold text-white/90 [writing-mode:vertical-rl] rotate-180"
                  aria-hidden
                >
                  {index + 1}
                </span>
              ) : null}
            </motion.button>
          );
        })}
        {safeVideo ? (
          <motion.button
            key="promo-video"
            type="button"
            role="listitem"
            layout={!reduceMotion}
            onClick={() => setActive(imageCount)}
            onMouseEnter={() => setHoveredIndex(imageCount)}
            onFocus={() => setHoveredIndex(imageCount)}
            onBlur={() => setHoveredIndex(null)}
            aria-label={labels.video}
            aria-current={imageCount === activeIndex ? "true" : undefined}
            className={cn(
              "relative shrink-0 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
              isCream ? "shadow-md" : "border border-violet-500/30",
            )}
            initial={false}
            animate={{
              flex: imageCount === focusedIndex ? 4.2 : 0.65,
              opacity: imageCount === focusedIndex ? 1 : 0.72,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 220, damping: 28, mass: 0.8 }
            }
            style={{ minWidth: imageCount === focusedIndex ? undefined : "3.25rem" }}
          >
            {imageCount === focusedIndex ? (
              <div className="absolute inset-0 bg-black">
                {isYoutubeUrl(safeVideo) ? (
                  <YoutubeEmbed videoUrl={safeVideo} title={title} className="h-full w-full" />
                ) : (
                  <video
                    src={safeVideo}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                    title={title}
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-violet-950 to-slate-950">
                <span className="text-2xl" aria-hidden>
                  ▶
                </span>
                <span className="text-[10px] font-bold text-violet-200">{labels.video}</span>
              </div>
            )}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                imageCount === focusedIndex
                  ? "opacity-0"
                  : "bg-black/35 opacity-100",
              )}
              aria-hidden
            />
          </motion.button>
        ) : null}
      </div>

      {showCaption ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedIndex}
            className={cn(
              "mt-4 min-h-[4.5rem]",
              isCream ? "text-slate-800" : "text-white",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow ? (
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.22em]",
                  isCream ? "text-amber-700/80" : "text-cyan-400/90",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h3 className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h3>
            {subtitle ? (
              <p className={cn("mt-1 text-sm", isCream ? "text-slate-600" : "text-slate-400")}>
                {subtitle}
              </p>
            ) : null}
            <p className={cn("mt-2 text-xs", isCream ? "text-slate-500" : "text-slate-500")}>
              {focusedIndex + 1} / {count}
            </p>
          </motion.div>
        </AnimatePresence>
      ) : null}

      {count > 1 && !reduceMotion ? (
        <div
          className={cn(
            "mt-3 h-0.5 overflow-hidden rounded-full",
            isCream ? "bg-black/8" : "bg-white/10",
          )}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
            animate={{ width: `${((focusedIndex + 1) / count) * 100}%` }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </div>
      ) : null}
    </div>
  );
}
