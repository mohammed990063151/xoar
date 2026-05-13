"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Locale } from "@/lib/i18n";

/**
 * Saudi business context — Horasis Global Arab Business Meeting (Commons, CC BY-SA).
 * Source: https://commons.wikimedia.org/wiki/File:Sulaiman_Al-Assaf,_CEO,_Middle_East_Investment_Corporation,_Saudi_Arabia,_2012_Horasis_Global_Arab_Business_Meeting_(8268144196).jpg
 */
const HERO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Sulaiman_Al-Assaf%2C_CEO%2C_Middle_East_Investment_Corporation%2C_Saudi_Arabia%2C_2012_Horasis_Global_Arab_Business_Meeting_%288268144196%29.jpg/1920px-Sulaiman_Al-Assaf%2C_CEO%2C_Middle_East_Investment_Corporation%2C_Saudi_Arabia%2C_2012_Horasis_Global_Arab_Business_Meeting_%288268144196%29.jpg";

const HERO_IMAGE_ALT_AR =
  "مشهد من ملتقى أعمال عربي مع مسؤول سعودي في سياق اقتصادي";
const HERO_IMAGE_ALT_EN =
  "Saudi executive at an Arab business forum — economic context";

function SaudiGeometryOverlay(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full text-emerald-400/25"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="geoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <motion.g
        initial={{ opacity: 0.35 }}
        animate={{ opacity: [0.25, 0.55, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 40%" }}
      >
        <motion.path
          d="M50 8 L62 38 L94 38 L68 58 L78 92 L50 72 L22 92 L32 58 L6 38 L38 38 Z"
          fill="none"
          stroke="url(#geoStroke)"
          strokeWidth="0.45"
          vectorEffect="non-scaling-stroke"
          style={{ transformOrigin: "50px 50px" }}
          initial={{ pathLength: 0.3 }}
          animate={{ pathLength: [0.25, 1, 0.35], rotate: [0, 4, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M50 18 L58 40 L82 40 L64 54 L70 78 L50 66 L30 78 L36 54 L18 40 L42 40 Z"
          fill="none"
          stroke="url(#geoStroke)"
          strokeWidth="0.3"
          opacity={0.55}
          vectorEffect="non-scaling-stroke"
          style={{ transformOrigin: "50px 50px" }}
          initial={{ pathLength: 0.5 }}
          animate={{ pathLength: [0.4, 1, 0.45], rotate: [0, -5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.g>
    </svg>
  );
}

function SandMotes(): React.ReactElement {
  const motes = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 7) % 100}%`,
    top: `${(i * 23) % 85}%`,
    delay: i * 0.35,
    dur: 10 + (i % 5) * 2,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className="absolute h-1 w-1 rounded-full bg-amber-200/40 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
          style={{ left: m.left, top: m.top }}
          animate={{
            y: [0, -40, -10, -55],
            x: [0, 12, -8, 6],
            opacity: [0, 0.9, 0.4, 0],
            scale: [0.5, 1.2, 0.8, 0.3],
          }}
          transition={{
            duration: m.dur,
            repeat: Infinity,
            delay: m.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface HeroSaudiBannerProps {
  readonly locale: Locale;
}

export function HeroSaudiBanner({
  locale,
}: HeroSaudiBannerProps): React.ReactElement {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 38, damping: 18 });
  const sy = useSpring(my, { stiffness: 38, damping: 18 });
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(16,185,129,0.18), transparent 55%), radial-gradient(380px circle at calc(100% - ${sx}px) calc(100% - ${sy}px), rgba(212,175,55,0.12), transparent 50%)`;

  useEffect(() => {
    const wrap = imgWrapRef.current;
    if (!wrap) return;

    const tween = gsap.to(wrap, {
      scale: 1.07,
      xPercent: -2.2,
      yPercent: -0.7,
      duration: 28,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <div
        ref={imgWrapRef}
        className="absolute inset-[3.5%] sm:inset-[4.5%] lg:inset-[5%] will-change-transform rounded-2xl sm:rounded-3xl"
      >
        <Image
          src={HERO_IMAGE}
          alt={locale === "ar" ? HERO_IMAGE_ALT_AR : HERO_IMAGE_ALT_EN}
          fill
          priority
          className="rounded-2xl object-cover object-[center_22%] sm:rounded-3xl sm:object-[center_25%]"
          sizes="100vw"
        />
      </div>

      <motion.div
        className="absolute inset-0"
        style={{ background: spotlight }}
        aria-hidden
      />

      <div
        className="hero-saudi-aurora pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#021a12]/92 via-[#05050c]/75 to-[#05050c]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,108,53,0.35),transparent_50%),radial-gradient(ellipse_at_90%_30%,rgba(212,175,55,0.12),transparent_45%),radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.2),transparent_55%)]" />

      <SaudiGeometryOverlay />
      <SandMotes />

      <motion.div
        className="pointer-events-none absolute -start-[20%] top-1/4 h-[120%] w-[55%] rotate-12 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl"
        animate={{ opacity: [0.25, 0.55, 0.3], x: [0, 24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -end-[10%] bottom-0 h-[70%] w-[45%] -rotate-6 bg-gradient-to-t from-amber-500/15 via-transparent to-transparent blur-3xl"
        animate={{ opacity: [0.2, 0.45, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
