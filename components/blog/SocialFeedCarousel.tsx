"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import type { BlogSocialFeedCopy, SocialFeedPostItem, SocialPlatform } from "@/lib/site-page";
import { siteContainer } from "@/lib/layout";

interface SocialFeedCarouselProps {
  readonly locale: Locale;
  readonly copy: BlogSocialFeedCopy;
  readonly posts: readonly SocialFeedPostItem[];
}

const PLATFORM_RING: Record<SocialPlatform, string> = {
  instagram: "from-pink-500 via-purple-500 to-orange-400",
  x: "from-slate-200 to-slate-400",
  facebook: "from-blue-500 to-blue-700",
  tiktok: "from-cyan-400 via-white to-pink-500",
  youtube: "from-red-500 to-red-700",
  snapchat: "from-yellow-300 to-yellow-500",
  linkedin: "from-sky-500 to-blue-700",
};

function PlatformBadge({ platform }: { readonly platform: SocialPlatform }): React.ReactElement {
  const labels: Record<SocialPlatform, string> = {
    instagram: "IG",
    x: "X",
    facebook: "f",
    tiktok: "♪",
    youtube: "▶",
    snapchat: "👻",
    linkedin: "in",
  };

  return (
    <span
      className={cn(
        "absolute -end-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white shadow-lg ring-2 ring-[#05050c]",
        PLATFORM_RING[platform],
      )}
      aria-hidden
    >
      {labels[platform]}
    </span>
  );
}

export function SocialFeedCarousel({
  locale,
  copy,
  posts,
}: SocialFeedCarouselProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion() ?? false;
  const ar = locale === "ar";
  const items = useMemo(() => posts.filter((post) => post.authorName.trim() !== ""), [posts]);
  const count = items.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = items[index] ?? items[0];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused || reduceMotion) return;
    const id = window.setTimeout(goNext, 7000);
    return () => window.clearTimeout(id);
  }, [count, paused, reduceMotion, index, goNext]);

  if (count === 0) return null;

  const metaLine = [current.authorHandle, current.subtitle || current.publishedAt]
    .filter(Boolean)
    .join(" · ");

  const labels = {
    prev: ar ? "السابق" : "Previous",
    next: ar ? "التالي" : "Next",
    open: ar ? "فتح المنشور" : "Open post",
  };

  const CardContent = (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45 }}
        >
          {current.coverImage ? (
            <Image
              src={current.coverImage}
              alt=""
              fill
              unoptimized={useUnoptimizedImage(current.coverImage)}
              className="object-cover object-center scale-110 blur-md"
              sizes="100vw"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[#05050c]/82" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05050c] via-transparent to-[#05050c]/60" />

      <div className="relative z-[1] flex min-h-[min(520px,78vh)] flex-col items-center justify-center px-4 py-14 sm:px-8 sm:py-16">
        <h2 className="text-center text-[clamp(1.35rem,4vw,2rem)] font-bold uppercase tracking-[0.18em] text-white">
          {copy.title}
        </h2>
        {copy.subtitle ? (
          <p className="mt-2 max-w-xl text-center text-sm text-slate-400 sm:text-base">{copy.subtitle}</p>
        ) : null}

        <div className="relative mt-10 flex w-full max-w-3xl items-center justify-center gap-4 sm:mt-12 sm:gap-8">
          {count > 1 ? (
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goPrev();
              }}
              aria-label={labels.prev}
            >
              ‹
            </button>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`content-${current.id}`}
              className="flex min-w-0 flex-1 flex-col items-center text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="relative">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-white/90 bg-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:h-32 sm:w-32">
                  {current.authorAvatar ? (
                    <Image
                      src={current.authorAvatar}
                      alt=""
                      fill
                      unoptimized={useUnoptimizedImage(current.authorAvatar)}
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 text-2xl font-bold text-white">
                      {current.authorName.charAt(0)}
                    </div>
                  )}
                </div>
                <PlatformBadge platform={current.platform} />
              </div>

              <p className="mt-5 text-lg font-semibold text-white sm:text-xl">{current.authorName}</p>
              {metaLine ? (
                <p className="mt-1 text-sm text-slate-400">{metaLine}</p>
              ) : null}
              {current.caption ? (
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                  {current.caption}
                </p>
              ) : null}
              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-violet-300/90">
                {current.platformLabel}
              </p>
            </motion.div>
          </AnimatePresence>

          {count > 1 ? (
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                goNext();
              }}
              aria-label={labels.next}
            >
              ›
            </button>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="mt-8 flex gap-2">
            {items.map((post, i) => (
              <button
                key={post.id}
                type="button"
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/55",
                )}
                onClick={() => goTo(i)}
                aria-label={`${ar ? "منشور" : "Post"} ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <section
      className="relative mt-4 overflow-hidden border-y border-white/10"
      aria-label={copy.title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        {current.postUrl ? (
          <a
            href={current.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block"
            aria-label={labels.open}
          >
            {CardContent}
          </a>
        ) : (
          <div className="relative">{CardContent}</div>
        )}
      </div>

      <div className={cn(siteContainer, "relative z-[2] -mt-2 pb-6")}>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from(new Map(items.map((p) => [p.platform, p])).values()).map((post) =>
            post.profileUrl ? (
              <a
                key={post.platform}
                href={post.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-violet-400/40 hover:text-white"
              >
                {post.platformLabel}
              </a>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
