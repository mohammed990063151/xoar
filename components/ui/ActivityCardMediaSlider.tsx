"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { isYoutubeUrl } from "@/lib/video-embed";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";

export type ActivityCardMediaSlide =
  | { readonly type: "image"; readonly url: string }
  | { readonly type: "video"; readonly url: string };

interface ActivityCardMediaSliderProps {
  readonly slides: readonly ActivityCardMediaSlide[];
  readonly title: string;
  readonly locale: Locale;
  readonly className?: string;
  readonly onSlideClick?: () => void;
  readonly imagePriority?: boolean;
}

function isValidSlideUrl(url: string): boolean {
  return typeof url === "string" && url.trim() !== "";
}

export function ActivityCardMediaSlider({
  slides,
  title,
  locale,
  className,
  onSlideClick,
  imagePriority = false,
}: ActivityCardMediaSliderProps): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const validSlides = useMemo(
    () => slides.filter((s) => isValidSlideUrl(s.url)),
    [slides],
  );
  const count = validSlides.length;
  const ar = locale === "ar";

  useEffect(() => {
    if (index >= count && count > 0) {
      setIndex(0);
    }
  }, [index, count]);

  const go = useCallback(
    (next: number) => {
      if (count <= 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => go(index + 1), 5500);
    return () => window.clearInterval(id);
  }, [paused, count, index, go]);

  const current = validSlides[index] ?? validSlides[0];

  const dots = useMemo(
    () =>
      validSlides.map((s, i) => ({
        i,
        isVideo: s.type === "video",
      })),
    [validSlides],
  );

  if (count === 0) {
    return (
      <div
        className={cn(
          "relative flex w-full items-center justify-center bg-slate-900 text-slate-500",
          "min-h-[240px] sm:min-h-[280px]",
          className,
        )}
        style={{ aspectRatio: "4 / 5" }}
      >
        <span className="text-xs">{ar ? "لا توجد وسائط" : "No media"}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-slate-950",
        "min-h-[240px] sm:min-h-[280px]",
        className,
      )}
      style={{ aspectRatio: "4 / 5" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${index}-${current?.type}-${current?.type === "image" ? current.url : current?.url}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {current?.type === "video" && isValidSlideUrl(current.url) ? (
            <div className="absolute inset-0 bg-black">
              {isYoutubeUrl(current.url) ? (
                <YoutubeEmbed videoUrl={current.url} title={title} className="h-full w-full" />
              ) : (
                <video
                  src={current.url}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  title={title}
                />
              )}
            </div>
          ) : current?.type === "image" && isValidSlideUrl(current.url) ? (
            <button
              type="button"
              className="absolute inset-0 block h-full w-full cursor-pointer border-0 bg-transparent p-0"
              onClick={onSlideClick}
              aria-label={title}
            >
              <Image
                src={current.url.trim()}
                alt={title}
                fill
                unoptimized={useUnoptimizedImage(current.url)}
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
                priority={imagePriority && index === 0}
              />
            </button>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050c] via-[#05050c]/15 to-transparent"
        aria-hidden
      />

      {count > 1 ? (
        <>
          <button
            type="button"
            className="absolute start-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(index - 1);
            }}
            aria-label={ar ? "السابق" : "Previous"}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute end-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(index + 1);
            }}
            aria-label={ar ? "التالي" : "Next"}
          >
            ›
          </button>
          <div className="absolute bottom-[4.5rem] inset-x-0 z-20 flex justify-center gap-1.5">
            {dots.map(({ i, isVideo }) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60",
                  isVideo && i !== index && "ring-1 ring-violet-400/50",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                aria-label={
                  isVideo
                    ? ar
                      ? `فيديو ${i + 1}`
                      : `Video ${i + 1}`
                    : ar
                      ? `صورة ${i + 1}`
                      : `Image ${i + 1}`
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
