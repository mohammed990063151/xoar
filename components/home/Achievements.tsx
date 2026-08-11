"use client";

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { XoraLogo } from "@/components/brand/XoraLogo";
import type { Dictionary } from "@/lib/dictionary";
import { homeSectionTitle, siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

interface AchievementsProps {
  readonly data: Dictionary["achievements"];
}

const STAT_STYLES = [
  {
    gradient: "from-violet-600 to-purple-700",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.35)]",
    ring: "ring-violet-500/30",
    iconBg: "bg-violet-500/20 text-violet-300",
    accent: "text-violet-300",
    bar: "from-violet-500 to-purple-500",
  },
  {
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.35)]",
    ring: "ring-cyan-500/30",
    iconBg: "bg-cyan-500/20 text-cyan-300",
    accent: "text-cyan-300",
    bar: "from-cyan-400 to-blue-500",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.35)]",
    ring: "ring-emerald-500/30",
    iconBg: "bg-emerald-500/20 text-emerald-300",
    accent: "text-emerald-300",
    bar: "from-emerald-400 to-teal-500",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.35)]",
    ring: "ring-amber-500/30",
    iconBg: "bg-amber-500/20 text-amber-300",
    accent: "text-amber-300",
    bar: "from-amber-400 to-orange-500",
  },
];

function Stat({
  value,
  suffix,
  label,
  icon,
  index,
}: {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly index: number;
}): React.ReactElement {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const style = STAT_STYLES[index % STAT_STYLES.length];

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (cancelled) return;
      const controls = animate(0, value, {
        duration: 1.8,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => { if (!cancelled) setN(Math.round(v)); },
      });
      return () => controls.stop();
    }, index * 120);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, inView, index]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "achievements-stat group relative overflow-hidden rounded-3xl border bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-500 sm:p-7",
        style.ring,
        "border-white/10 hover:border-white/20",
        style.glow,
      )}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      {/* Background gradient blob */}
      <div
        className={cn(
          "pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40",
          style.gradient,
        )}
        aria-hidden
      />

      {/* Icon */}
      <div className={cn("relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", style.iconBg)}>
        {icon}
      </div>

      {/* Number */}
      <div className="relative">
        <span className={cn("text-4xl font-black tabular-nums tracking-tight sm:text-5xl", style.accent)}>
          {n}
        </span>
        <span className={cn("text-2xl font-bold sm:text-3xl", style.accent)}>{suffix}</span>
      </div>

      {/* Label */}
      <p className="relative mt-2 text-sm font-medium text-slate-300 sm:text-base">{label}</p>

      {/* Bottom accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          style.bar,
        )}
        aria-hidden
      />
    </motion.div>
  );
}

function IconStar(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.7L12 16.9 6.8 18.9l1-5.7L3.6 9.1l5.8-.8L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconPin(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9.5h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers(): React.ReactElement {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 19c0-2-1.5-3.5-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Achievements({ data }: AchievementsProps): React.ReactElement {
  const hasTitle = Boolean(data.title?.trim());

  const stats = [
    { value: Number(data.clientsValue) || 150, suffix: data.clientsSuffix || "+", label: data.clients, icon: <IconUsers /> },
    { value: Number(data.eventsValue) || 350,  suffix: data.eventsSuffix  || "+", label: data.events,  icon: <IconCalendar /> },
    { value: Number(data.citiesValue) || 20,   suffix: data.citiesSuffix  || "+", label: data.cities,  icon: <IconPin /> },
    { value: Number(data.yearsValue)  || 10,   suffix: data.yearsSuffix   || "+", label: data.years,   icon: <IconStar /> },
  ];

  return (
    <section className={cn(siteContainer, "pb-16 pt-10 sm:pb-20 sm:pt-12")}>
      {/* Heading */}
      {hasTitle ? (
        <ScrollReveal className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/90">
            {data.title?.includes("رق") || data.title?.includes("إنجاز") ? "إنجازاتنا" : "Our achievements"}
          </p>
          <h2 className={cn("mt-2 gradient-text", homeSectionTitle)}>{data.title}</h2>
        </ScrollReveal>
      ) : null}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {stats.map((s, i) => (
          <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} icon={s.icon} index={i} />
        ))}
      </div>

      {/* Vision strip */}
      <ScrollReveal>
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900/80 to-slate-950/60 px-8 py-10 text-center backdrop-blur-sm">
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -start-16 top-0 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -end-16 bottom-0 h-40 w-40 rounded-full bg-cyan-600/15 blur-3xl" aria-hidden />

          <p className="relative mx-auto max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {data.vision}
          </p>
          <div className="relative mt-5 flex justify-center" role="img" aria-label="xora">
            <XoraLogo size="md" />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
