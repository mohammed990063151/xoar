"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EventRequestLink } from "@/components/ui/EventRequestLink";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { HomeHero } from "@/lib/home-content";
import { optimizePosterUrl } from "@/lib/media-url";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

const HERO_POSTER_FALLBACK =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=960&q=70&auto=format";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function useHeroVideoPlayback(
  videoSrc: string | undefined,
  reduceMotion: boolean | null,
): { playVideo: boolean; videoPreload: "none" | "metadata" | "auto" } {
  const [playVideo, setPlayVideo] = useState(Boolean(videoSrc && !reduceMotion));
  const [videoPreload, setVideoPreload] = useState<"none" | "metadata" | "auto">("auto");

  useEffect(() => {
    if (!videoSrc || reduceMotion) {
      setPlayVideo(false);
      return;
    }

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Mobile: keep preload light; large hero MP4 can stutter on cellular.
    setVideoPreload(isMobile ? "metadata" : "auto");

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    const saveData = Boolean(connection?.saveData);
    const effectiveType = (connection?.effectiveType || "").toLowerCase();
    const slowNetwork =
      effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g";

    // If user explicitly prefers saving data or is on a slow cellular network,
    // show the poster only (no autoplay attempts → no visible buffering).
    if (saveData || (isMobile && slowNetwork)) {
      setPlayVideo(false);
      return;
    }

    setPlayVideo(true);
  }, [videoSrc, reduceMotion]);

  return { playVideo, videoPreload };
}

function HeroBackgroundMedia({
  videoSrc,
  posterSrc,
  playVideo,
  videoPreload,
}: {
  videoSrc: string | undefined;
  posterSrc: string;
  playVideo: boolean;
  videoPreload: "none" | "metadata" | "auto";
}): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!playVideo || !videoSrc || !video) {
      setVideoVisible(false);
      return;
    }

    let cancelled = false;

    const showVideo = () => {
      if (!cancelled) setVideoVisible(true);
    };

    const hideVideo = () => {
      if (!cancelled) setVideoVisible(false);
    };

    const tryPlay = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
        showVideo();
      } catch {
        hideVideo();
      }
    };

    video.addEventListener("playing", showVideo);
    video.addEventListener("pause", hideVideo);
    video.addEventListener("error", hideVideo);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void tryPlay();
    } else {
      video.addEventListener("loadeddata", () => void tryPlay(), { once: true });
      video.addEventListener("canplay", () => void tryPlay(), { once: true });
      void tryPlay();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("playing", showVideo);
      video.removeEventListener("pause", hideVideo);
      video.removeEventListener("error", hideVideo);
    };
  }, [playVideo, videoSrc]);

  return (
    <>
      {/* Poster always visible — mobile autoplay often fails; avoids black hero */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
        fetchPriority="high"
        decoding="async"
        aria-hidden
      />
      {playVideo && videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          className={cn(
            "absolute inset-0 h-full w-full scale-105 object-cover object-center transition-opacity duration-500",
            videoVisible ? "opacity-100" : "opacity-0",
          )}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload={videoPreload}
          autoPlay
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}

interface HeroSectionProps {
  readonly locale: Locale;
  readonly hero: HomeHero;
}

export function HeroSection({
  locale,
  hero,
}: HeroSectionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const videoSrc = hero.videoUrl?.trim() || undefined;
  const { playVideo, videoPreload } = useHeroVideoPlayback(videoSrc, reduceMotion);
  const posterSrc =
    optimizePosterUrl(hero.videoPoster?.trim()) ?? HERO_POSTER_FALLBACK;

  const orbs = reduceMotion
    ? []
    : [
        { className: "start-[8%] top-[18%] h-40 w-40 bg-violet-500/25 sm:h-56 sm:w-56", duration: 14 },
        { className: "end-[10%] top-[28%] h-36 w-36 bg-cyan-500/20 sm:h-44 sm:w-44", duration: 18 },
      ];

  return (
    <section className="relative min-h-[min(100svh,640px)] overflow-hidden rounded-b-2xl border-b border-white/5 sm:min-h-[82vh] sm:rounded-b-[2.5rem] lg:min-h-[85vh]">
      {!reduceMotion
        ? orbs.map((orb) => (
            <motion.div
              key={orb.className}
              className={`pointer-events-none absolute rounded-full blur-3xl ${orb.className}`}
              aria-hidden
              animate={{
                y: [0, -18, 8, 0],
                x: [0, 12, -8, 0],
                scale: [1, 1.08, 0.96, 1],
              }}
              transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
            />
          ))
        : null}
      <div className="absolute inset-0">
        <HeroBackgroundMedia
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          playVideo={playVideo}
          videoPreload={videoPreload}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/65 to-[#020617]/35" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-transparent to-purple-950/35" />
      </div>

      <div className="hero-wave-lines pointer-events-none absolute inset-x-0 bottom-0 hidden h-32 opacity-80 sm:block sm:h-40">
        <svg
          className="h-full w-full text-purple-500/35"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="heroWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            fill="none"
            stroke="url(#heroWaveGrad)"
            strokeWidth="2"
            d="M0,90 C180,40 360,110 540,70 C720,30 900,100 1080,60 C1260,20 1380,80 1440,50"
          />
        </svg>
      </div>

      <div
        className={cn(
          siteContainer,
          "relative z-[1] flex min-h-[min(100svh,640px)] flex-col justify-end pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-[4.5rem] sm:min-h-[82vh] sm:pb-16 sm:pt-28 lg:min-h-[85vh] lg:pb-20",
        )}
      >
        <motion.div
          className="mx-auto w-full max-w-3xl space-y-3 text-center sm:mx-0 sm:space-y-6 sm:text-start"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p
            className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-medium leading-snug text-cyan-100/90 backdrop-blur-md sm:mx-0 sm:justify-start sm:px-4 sm:text-xs"
            variants={item}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {locale === "ar" ? "فعاليات · أنشطة · احتفالات" : "Events · Activities · Celebrations"}
          </motion.p>
          <motion.h1
            className="text-[clamp(1.65rem,6.5vw,3.25rem)] font-bold leading-[1.15] tracking-tight text-white text-balance"
            variants={item}
          >
            <span className="block sm:inline">{hero.title}</span>{" "}
            <span className="gradient-text">{hero.titleHighlight}</span>{" "}
            <span className="text-white">{hero.titleEnd}</span>
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-200/95 sm:mx-0 sm:text-base md:text-lg"
            variants={item}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            className="flex flex-col items-stretch gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:pt-0"
            variants={item}
          >
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href={localizedPath(locale, "/activities")}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-l from-blue-600 via-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(59,130,246,0.35)] transition hover:brightness-110 sm:w-auto sm:px-7 sm:py-3.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3-3" strokeLinecap="round" />
                  </svg>
                </span>
                {hero.primaryCta}
                <span className="text-lg transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
            <EventRequestLink
              locale={locale}
              label={hero.eventRequestCta ?? (locale === "ar" ? "طلب فعالية" : "Request an event")}
              variant="hero"
            />
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href={localizedPath(locale, "/events")}
                className="group inline-flex w-full items-center justify-center gap-2 py-1.5 text-sm font-medium text-slate-200 transition hover:text-white sm:w-auto sm:justify-start"
              >
                {hero.secondaryCta}
                <span className="transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>
                  →
                </span>
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
